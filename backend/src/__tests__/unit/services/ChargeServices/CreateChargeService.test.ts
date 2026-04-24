import CreateChargeService from "../../../../services/ChargeServices/CreateChargeService";
import AppError from "../../../../errors/AppError";

describe("CreateChargeService", () => {
  it("should create a charge with valid data", async () => {
    const tenantId = 1;
    const contactId = 1;

    const result = await CreateChargeService({
      description: "Test Charge",
      amount: 100.0,
      contractNumber: "CONTRACT-001",
      tenantId,
      contactId
    });

    expect(result).toHaveProperty("id");
    expect(result.description).toBe("Test Charge");
    expect(result.amount).toBe(100.0);
    expect(result.status).toBe("pending");
  });

  it("should throw error if neither contactId nor ticketId is provided", async () => {
    const tenantId = 1;

    await expect(
      CreateChargeService({
        description: "Test Charge",
        amount: 100.0,
        tenantId
      })
    ).rejects.toThrow(AppError);
  });

  it("should throw error if amount is not positive", async () => {
    const tenantId = 1;
    const contactId = 1;

    await expect(
      CreateChargeService({
        description: "Test Charge",
        amount: -100.0,
        tenantId,
        contactId
      })
    ).rejects.toThrow();
  });

  it("should throw error if description is empty", async () => {
    const tenantId = 1;
    const contactId = 1;

    await expect(
      CreateChargeService({
        description: "",
        amount: 100.0,
        tenantId,
        contactId
      })
    ).rejects.toThrow();
  });
});
