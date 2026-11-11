# Validate the shared summit archive without adding build dependencies.
require 'yaml'
root=File.expand_path('..',__dir__)
data=YAML.safe_load(File.read(File.join(root,'_data/summit.yml')))
films=YAML.safe_load(File.read(File.join(root,'_data/films.yml')))
abort 'summit.yml must remain a list' unless data.is_a?(Array)
ids=[];events=[]
data.each do |mountain|
 %w[name elevation country year image slug archive_id summit_count expeditions].each{|key|abort "Missing #{key}: #{mountain['name']}" unless mountain.key?(key)}
 id=mountain['archive_id'];abort 'Invalid or duplicate mountain ID' unless id.is_a?(String)&&id.match?(/\A[a-z0-9-]+\z/)&&!ids.include?(id);ids << id
 count=mountain['summit_count'];abort "Invalid cumulative count: #{id}" unless count.nil?||(count.is_a?(Integer)&&count>=0)
 elevation=mountain['elevation_m'];abort "Invalid elevation: #{id}" unless elevation.nil?||(elevation.is_a?(Integer)&&elevation>0&&elevation<9000)
 %w[first_ascent guiding].each{|key|abort "Invalid #{key}: #{id}" unless [nil,true,false].include?(mountain[key])}
 image=mountain['image'];abort "Missing image: #{image}" if image&&!File.file?(File.join(root,image.sub(%r{\A/},'')))
 records=mountain['expeditions'];abort "Invalid expedition list: #{id}" unless records.nil?||records.is_a?(Array)
 (records||[]).each do |record|
  event=record['id'];abort 'Duplicate or missing expedition ID' unless event.is_a?(String)&&!events.include?(event);events << event
  abort 'Film projects cannot count as successful summits' if record['type']=='film_project'&&record['counts_toward_summits']!=false
  slug=record['film_slug'];abort "Unknown film: #{slug}" if slug&&!films.key?(slug)
 end
end
puts "Validated #{data.size} mountain records and #{events.size} individual expedition/film records."
