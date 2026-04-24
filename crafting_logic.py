class Inventory:
    def __init__(self):
        self.items = {}

    def add_item(self, item_name, quantity):
        self.items[item_name] = self.items.get(item_name, 0) + quantity

    def remove_item(self, item_name, quantity):
        if self.items.get(item_name, 0) >= quantity:
            self.items[item_name] -= quantity
            if self.items[item_name] == 0: del self.items[item_name]
            return True
        return False

class CraftingSystem:
    def __init__(self):
        self.recipes = {
            "Wooden Sword": {"Wood": 3, "Stone": 1},
            "Iron Axe": {"Wood": 2, "Iron": 3}
        }

    def craft_item(self, item_name, inventory):
        recipe = self.recipes.get(item_name)
        if not recipe: return None
        for ing, qty in recipe.items():
            if inventory.items.get(ing, 0) < qty: return None
        for ing, qty in recipe.items():
            inventory.remove_item(ing, qty)
        return {"name": item_name, "quality": "Standard"}
