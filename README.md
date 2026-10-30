# Sunil Tamang portfolio

A Jekyll site with film, service, summit and team collections.

## Local development

Use Ruby 3.1 or newer and Bundler, then run:

```sh
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000. Edit shared styles in `_sass/`; the entry files
in `assets/css/` need their YAML front matter to generate CSS. The `main.scss`
entry includes the site styles. `style.scss` also builds a standalone stylesheet.

## Verification

```sh
bundle exec jekyll build --trace
bundle exec jekyll doctor
node --check assets/js/main.js
python3 scripts/check_site.py
```

To verify deployment under a subdirectory:

```sh
bundle exec jekyll build --baseurl /preview --destination /tmp/sunil-tamang-preview
python3 scripts/check_site.py /tmp/sunil-tamang-preview --baseurl /preview
```

Deploy the generated `_site/` directory using a Jekyll 4 build. Set `url` and
`baseurl` in `_config.yml` for the deployment location.

## Content and contact setup

The contact form uses FormSubmit with the existing public address configured in
`_config.yml` as `email`. The mailbox owner must activate FormSubmit before it
can deliver messages; delivery has not been tested by submitting the form.

The Alpine gallery referenced files absent from the repository, so those gallery
entries are omitted until photos are supplied. The Baruntse gallery only renders
files present in the repository. Missing team portraits use the corresponding
existing team images. Sonam's page uses the name, role and image already in the
team data; a biography can be added in `_team/sonam.md`.

Only the existing Instagram profile is linked. Add verified YouTube/Vimeo URLs
before restoring links for those platforms.
