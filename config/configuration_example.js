var config = {};

config.server = {};
config.google = {};
config.facebook = {};
config.db = {};

config.server.IP = "localhost";
config.server.PORT =80;

config.google.GOOGLE_CLIENT_ID = "";
config.google.GOOGLE_CLIENT_SECRET = "";
config.google.GOOGLE_RETURN_URL = "http://localhost/auth/google/callback";

config.facebook.FACEBOOK_CLIENT_ID = "";
config.facebook.FACEBOOK_CLIENT_SECRET = "";
config.facebook.FACEBOOK_RETURN_URL = "http://localhost/auth/facebook/callback";

config.db.connectionString = "mongodb://localhost/Grapevine";

module.exports = config;
