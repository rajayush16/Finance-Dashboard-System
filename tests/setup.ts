process.env.NODE_ENV = "test";
process.env.PORT = "4000";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/finance_dashboard";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1d";
process.env.BCRYPT_SALT_ROUNDS = "10";
process.env.CORS_ORIGIN = "*";
process.env.SWAGGER_ENABLED = "false";

beforeEach(() => {
  jest.clearAllMocks();
});
