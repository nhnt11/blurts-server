# Firefox Monitor Server

## Summary

Firefox Monitor notifies users when their credentials have been compromised in a data breach.

This code is for the monitor.firefox.com service & website.

Breach data is powered by [haveibeenpwned.com](https://haveibeenpwned.com/).

See the [Have I Been Pwned about page](https://haveibeenpwned.com/About) for
the "what" and "why" of data breach alerts.

## Development

Please refer to our [coding standards](docs/coding-standards) information for code styles, naming conventions and other methodologies.  
### Requirements

* [Node](https://nodejs.org/) 10 (with npm)
* [Postgres](https://www.postgresql.org/)

### Install

1. Clone and change to the directory:

    ```sh
    git clone https://github.com/mozilla/blurts-server.git
    cd blurts-server
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Copy the `.env-dist` file to `.env`:

    ```sh
    cp .env-dist .env
    ```

### Run

1. Run the server:

    ```sh
    npm start
    ```

Note: `npm start` uses `onchange` and `nodemon` to automatically detect file
changes, re-compile static assets, and restart the express process. If you want
more control, see the `scripts` section of `package.json` for more commands.

2. Navigate to [localhost:6060/](http://localhost:6060/)

#### Database

To create the database tables ...

1. Create the `blurts` database:

   ```sh
   createdb blurts
   createdb test-blurts # for tests
   ```

2. Update the `DATABASE_URL` value in your `.env` file with your local db
   credentials:

   ```
   DATABASE_URL="postgres://<username>@localhost:<port>/blurts"
   ```

3. Run the migrations:

   ```
   npm run db:migrate
   ```

#### Emails

The included `.env-dist` sets `DEBUG_DUMMY_SMTP=1` which disables emails.

To send emails, you'll need to unset `DEBUG_DUMMY_SMTP` and supply real SMTP
config values for sending email.

You can set and source these via the `.env` file, or set them directly:

```sh
export DEBUG_DUMMY_SMTP=
export SMTP_HOST=<your-smtp-host>
export SMTP_PORT=<your-smtp-port>
export SMTP_USERNAME=<your-username>
export SMTP_PASSWORD=<your-password>
```

##### Trigger a breach alert email
To trigger a breach alert email, you need to make a `POST /hibp/notify` request:

* `Authorization: Bearer` header token value that matches `HIBP_NOTIFY_TOKEN`
* `Content-Type: application/json` header
* JSON body with `breachName`, `hashPrefix`, and `hashSuffix` values
  * `breachName` - string of a breach name in Monitor
  * `hashPrefix` - string of first 6 chars of a subscriber's `primary_sha1`
  * `hashSuffix` - array of strings of the remaining chars of the sha1 hash

E.g., a localhost `curl` command that triggers a breach alert email for the
Adobe breach to the `localmonitor20200827@mailinator.com` subscriber:

```
curl -v -H "Authorization: Bearer unsafe-default-token-for-dev" -H "Content-Type: application/json" -d '{"breachName": "Adobe", "hashPrefix": "365050", "hashSuffixes": ["53cbb89874fc738c0512daf12bc4d91765"]}' http://localhost:6060/hibp/notify
```

#### Firefox Accounts

Subscribe with a Firefox Account is controlled via the `FXA_ENABLED`
environment variable. (See `.env-dist`)

The repo comes with a development FxA oauth app pre-configured in `.env`, which
should work fine running the app on http://localhost:6060. You'll need to get
the `OAUTH_CLIENT_SECRET` value from someone in #fxmonitor-engineering.

## Testing

The full test suite can be run via `npm test`.

### Individual tests

To run individual tests, use `NODE_ENV=tests` and `jest`:

```
NODE_ENV=tests jest --runInBand tests/home.test.js
```

To run tests with interactive `debugger` lines enabled:

```
NODE_ENV=tests node inspect --harmony ./node_modules/.bin/jest tests/home.test.js
```

### Test Firefox Integration

Firefox's internal about:protections page ("Protections Dashboard") fetches and
displays breach stats for Firefox users who are signed into their FXA.

To test this part of Monitor:

1. [Set a Firefox profile to use the staging Firefox Accounts
   server.](https://mozilla.github.io/ecosystem-platform/docs/process/using-the-staging-environment#working-with-staging-firefox-accounts)
2. In the same profile, go to about:config and replace [all
   `https://monitor.firefox.com`
   values](https://searchfox.org/mozilla-central/search?q=monitor.firefox.com&path=browser/app/profile/firefox.js) with `http://localhost:6060`
3. Restart Firefox with that profile.
4. Go to `about:protections`
5. Everything should be using your localhost instance of Monitor.

### Lint

After installing the dependencies, you can lint the code by calling:

```sh
npm run lint
```

## Deployment

Firefox Monitor Breach Alerts is designed with [12-factor](https://12factor.net/) methodology.

### Deploy on Heroku

You will need to set some required environment variables on Heroku.

```sh
heroku config:set COOKIE_SECRET=unsafe-cookie-secret-for-heroku
heroku config:set DEBUG_DUMMY_SMTP=1
```

And any others, depending on the features you're running on Heroku - e.g.,
Email or Firefox Accounts.
