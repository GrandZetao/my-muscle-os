import { expect, test } from "@playwright/test";

test("local-first profile, plan and exercise flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("今天，")).toBeVisible();

  await page.getByRole("link", { name: "我的" }).last().click();
  await page.getByLabel("称呼").fill("测试训练者");
  await page.getByRole("button", { name: "保存个人档案" }).click();
  await expect(page.getByRole("status")).toContainText("已保存");

  await page.getByRole("link", { name: "训练" }).last().click();
  await page.getByRole("button", { name: /生成四日计划|重新生成/ }).click();
  await expect(page.getByText("上肢 A")).toBeVisible();

  await page.getByRole("link", { name: "动作" }).last().click();
  await page.getByPlaceholder("卧推、划船、深蹲…").fill("卧推");
  await expect(page.getByText("杠铃卧推")).toBeVisible();
});
