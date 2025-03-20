import { Then, When, world } from "@cucumber/cucumber";
import { ICustomWorld } from "../../utils/custom_world";
import { expect } from "@playwright/test";

let customWorld: ICustomWorld = world;

When(
  "I select the {string} with value {string} sorting option",
  async (optionLabel: string, optionValue: string) => {
    const dropdownElement = customWorld.page?.locator(
      'select[data-test="product-sort-container"]'
    );

    expect(dropdownElement).not.toBeNull();
    if (dropdownElement) {
      await dropdownElement.selectOption({
        label: optionLabel,
        value: optionValue,
      });
    }
  }
);

Then(
  "the inventory items should be sorted in the correct order corresponding to {string}",
  async function (optionValue: string) {
    const inventoryItems = customWorld?.page?.locator(
      'div[class="inventory_item"]'
    );
    expect(inventoryItems).not.toBeNull();

    const count = (await inventoryItems?.count()) ?? 0;
    for (let i = 0; i < count - 1; i++) {
      const currentItem = inventoryItems?.nth(i);
      const nextItem = inventoryItems?.nth(i + 1);

      expect(currentItem).not.toBeNull();
      expect(nextItem).not.toBeNull();

      console.log("Current item: ", currentItem);
      const itemPriceAttribute = "[data-test='inventory-item-price']";
      const itemNameAttribute = "[data-test='inventory-item-name']";
      // Current Item
      const currentItemPriceString = await currentItem
        ?.locator(itemPriceAttribute)
        .innerText();
      const currentItemPriceDouble = parseFloat(
        currentItemPriceString?.replaceAll("$", "") || ""
      );
      const currentItemName =
        (await currentItem?.locator(itemNameAttribute).innerText()) || "";

      const nextItemPriceString = await nextItem
        ?.locator(itemPriceAttribute)
        .innerText();
      const nextItemPriceDouble = parseFloat(
        nextItemPriceString?.replaceAll("$", "") || ""
      );
      const nextItemName =
        (await nextItem?.locator(itemNameAttribute).innerText()) || "";

      expect(currentItemPriceDouble).not.toBeNaN();
      expect(nextItemPriceDouble).not.toBeNaN();

      if (optionValue === "hilo") {
        expect(currentItemPriceDouble).toBeGreaterThanOrEqual(
          nextItemPriceDouble
        );
      } else if (optionValue === "lohi") {
        expect(currentItemPriceDouble).toBeLessThanOrEqual(nextItemPriceDouble);
      } else if (optionValue === "za") {
        const normalizedCurrentItemName = currentItemName.trim().toLowerCase();
        const normalizedNextItemName = nextItemName.trim().toLowerCase();
        const comparisonResult = normalizedCurrentItemName.localeCompare(
          normalizedNextItemName
        );
        expect(comparisonResult).toBeGreaterThanOrEqual(0);
      }
    }
  }
);

Then(
  "I should see an error dialog with error message {string}",
  async function (errorMessage: string) {
    await customWorld?.page?.on("dialog", (dialog) => {
      expect(dialog.message()).toBe(errorMessage);
      dialog.accept();
    });
  }
);
