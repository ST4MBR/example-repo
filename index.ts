import {
	EntityManager,
	EventsSDK,
	ExecuteOrder,
	dotaunitorder_t,
	Menu,
	Hero,
	item_armlet,
} from "github.com/octarine-public/wrapper/index";

const entry = Menu.AddEntry("Auto Armlet");
const toggle = entry.AddToggle("Enable Auto Armlet", false, "Automatically toggle Armlet when HP < 350");

let armletItem: item_armlet | null = null;

function getLocalHero(): Hero | null {
	const heroes = EntityManager.GetEntitiesByClass(Hero);
	return heroes.find(hero => hero.IsLocalPlayer) || null;
}

function findArmlet(hero: Hero): item_armlet | null {
	for (let slot = 0; slot < 6; slot++) {
		const item = hero.GetItem(slot);
		if (item instanceof item_armlet) {
			return item;
		}
	}
	return null;
}

function toggleArmlet(hero: Hero, armlet: item_armlet) {
	if (!armlet) return;

	const order = new ExecuteOrder(
		dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE,
		null,
		undefined,
		armlet,
		[hero],
		false,
		false,
		true
	);

	order.ExecuteQueued();
}

let armletActive = false;

EventsSDK.on("Tick", () => {
	if (!toggle.IsEnabled()) return;

	const hero = getLocalHero();
	if (!hero) return;

	if (!armletItem) {
		armletItem = findArmlet(hero);
		if (!armletItem) return;
	}

	if (hero.HP < 350 && !armletActive) {
		toggleArmlet(hero, armletItem);
		armletActive = true;
	} else if (hero.HP >= 350 && armletActive) {
		toggleArmlet(hero, armletItem);
		armletActive = false;
	}
});
