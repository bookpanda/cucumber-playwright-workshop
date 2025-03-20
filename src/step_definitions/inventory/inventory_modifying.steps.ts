import { Given, Then, When, world } from "@cucumber/cucumber";
import { ICustomWorld } from "../../utils/custom_world";
import { expect } from "@playwright/test";

let customWorld: ICustomWorld = world;

Given(
  "I log in to the inventory page with username {string} and password {string}",
  async function (username: string, password: string) {
    const page = customWorld.page;

    if (page) {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      await page.getByPlaceholder("Username").fill(username);
      await page.getByPlaceholder("Password").fill(password);
      await page
        .getByRole("button", {
          name: "Login",
        })
        .click(); // redirects to /inventory.html
    }
  }
);

When(
  "I add the first {int} items to the cart",
  async function (itemCount: number) {
    const inventoryItems = customWorld?.page?.locator(
      'div[class="inventory_item"]'
    );
    expect(inventoryItems).not.toBeNull();

    const count = (await inventoryItems?.count()) ?? 0;

    for (let i = 0; i < Math.min(count, itemCount); i++) {
      const item = inventoryItems?.nth(i);
      const addToCartButton = await item?.getByRole("button", {
        name: "Add to cart",
      });
      expect(addToCartButton).not.toBeNull();
      await addToCartButton?.click();
    }
  }
);

When(
  "I remove {int} items from the cart, starting with the first item displayed",
  async function (itemCount: number) {
    const inventoryItems = customWorld?.page?.locator(
      'div[class="inventory_item"]'
    );
    expect(inventoryItems).not.toBeNull();

    const count = (await inventoryItems?.count()) ?? 0;

    for (let i = 0; i < Math.min(count, itemCount); i++) {
      const item = inventoryItems?.nth(i);
      const addToCartButton = await item?.getByRole("button", {
        name: "Remove",
      });
      expect(addToCartButton).not.toBeNull();
      await addToCartButton?.click();
    }
  }
);

Then(
  "I should see {int} items in the cart",
  async function (itemCount: number) {
    const shoppingCartBadge = customWorld?.page?.locator(
      '[data-test="shopping-cart-badge"]'
    );
    expect(shoppingCartBadge).not.toBeNull();
    const count = (await shoppingCartBadge?.innerText()) ?? "0";
    const countInt = parseInt(count);
    expect(countInt).toBe(itemCount);
  }
);

Then(
  'I should see a "Remove" button for the remaining items',
  async function () {
    const inventoryItems = customWorld?.page?.locator(
      'div[class="inventory_item"]'
    );
    expect(inventoryItems).not.toBeNull();

    const count = (await inventoryItems?.count()) ?? 0;
    let removeButtonCount = 0;

    for (let i = 0; i < count; i++) {
      const item = inventoryItems?.nth(i);
      const removeButton = await item?.getByRole("button", {
        name: "Remove",
      });
      if (removeButton) {
        removeButtonCount++;
      }
    }

    expect(removeButtonCount).toBe(count);
  }
);
