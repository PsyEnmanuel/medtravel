const supertest = require("supertest");
import { expect, describe, it } from "vitest";
import "../../config.js";
import createServer from "../utils/server";

const app = createServer();

describe("user", () => {
  describe("get user route", () => {
    describe("login user", () => {
      it("should return 200", async () => {

        const { statusCode, body } = await supertest(app)
          .post("/api/user/login")
          .send({
            email: "enmanuelpsy@gmail.com",
            password: 908,
          });

        expect(statusCode).toBe(200);
      });
    });
  });
});
