import { expect, test } from "@playwright/test";

test("public lead submission appears in the dashboard", async ({ page }, testInfo) => {
  const leadName = `E2E ${testInfo.project.name} Lead`;

  await page.goto("/contact");
  await page.getByLabel("Name").fill(leadName);
  await page.getByLabel("Email").fill(`${testInfo.project.name}@example.com`);
  await page.getByLabel("Service desired").fill("Dental implants");
  await page
    .getByLabel("Message")
    .fill("I need an appointment this week and want to understand the price range.");
  await page.getByRole("button", { name: "Send request" }).click();

  await expect(page.getByText("Simulated AI response")).toBeVisible();

  await page.goto("/login");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  const leadLink = page
    .locator('[data-testid="lead-link"]:visible')
    .filter({ hasText: leadName })
    .first();
  await expect(leadLink).toBeVisible();
  await expect(page.getByText("Hot").first()).toBeVisible();

  await leadLink.click();
  await expect(page.getByText("AI classification")).toBeVisible();
  await expect(page.getByText("Follow-up tasks")).toBeVisible();
});
