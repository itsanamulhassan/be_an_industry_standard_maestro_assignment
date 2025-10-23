import mongoose from "mongoose";
import request from "supertest";
import environments from "./app/configurations/environments";
import app from "./app";
// ✅ Run before all tests: Connect to MongoDB
beforeAll(async () => {
  await mongoose.connect(environments.db_url);
});

// ✅ Run after each test: Clean all documents from every collection
// afterEach(async () => {
//   if (mongoose.connection.db) {
//     const collections = await mongoose.connection.db.collections();

//     // Loop through all collections and delete their documents
//     for (const collection of collections) {
//       await collection.deleteMany({});
//     }
//   }
// });

// ✅ Run after all tests: Close the MongoDB connection
afterAll(async () => {
  await mongoose.disconnect();
});

export const getToken = async (credentials: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string }> => {
  const res = await request(app).post("/api/v1/auth/signin").send(credentials);
  const accessToken = res.body?.data?.accessToken;
  const refreshToken = res.body?.data?.refreshToken;

  if (!accessToken) {
    throw new Error("Failed to get access token for testing.");
  }
  if (!refreshToken) {
    throw new Error("Failed to get refresh token for testing.");
  }

  return { accessToken, refreshToken };
};
