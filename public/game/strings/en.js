/* Axie Rift — English string dictionary (source locale). vi.js mirrors this key-for-key.
   See docs/I18N_MIGRATION_GUIDE.md.

   ⚠ The `hud.hint.*` group went away with the `#hint-bar` strip. Its content was not dropped —
   it moved into the Help panel (F6) under `help.*`, where it has room and is not covered by
   the combat bar. Key caps ('R', 'Esc') are deliberately NOT in here: they read the same in
   every language, and putting them in a dictionary invites a translation to rename a key.
   See HD_BANG in game.js. */
window.I18N_EN = {
  'help.title': 'Controls & Shortcuts',

  'help.g.battle': 'COMBAT',
  'help.k.move': 'Walk to where you clicked — works on the small map too',
  'help.k.attack': 'Basic attack',
  'help.k.skills': 'The four skill slots on the combat bar',
  'help.k.hp': 'Drink a Red Potion',
  'help.k.mp': 'Drink a Mana Flask',
  'help.k.auto': 'Toggle Auto-fight',
  'help.k.pick': 'Pick up loot · open a Warded Chest · mine a Bone Seam · gather herbs',
  'help.k.talk': 'Talk to whoever is standing nearby',
  'help.k.gate': 'Take the gate you are standing next to',
  'help.k.forge': 'Walk to the Blacksmith — press again once there to open the forge',
  'help.k.alt': 'Hold: show the name of EVERY item lying on the ground',

  'help.g.panels': 'PANELS',
  'help.k.char': 'Character — stats and sub-systems',
  'help.k.gear': 'Equipment + Inventory — the paper doll next to the bag grid',
  'help.k.bag': 'The same window as V',
  'help.k.skillp': 'Skills',
  'help.k.map': 'World Map',
  'help.k.quest': 'Quest Log',
  'help.k.minimap': 'Show/hide the small map',
  'help.k.settings': 'Settings',
  'help.k.help': 'This panel',
  'help.k.esc': 'Close the most recently opened panel',

  'help.g.auto': 'AUTO-FIGHT',
  'help.auto.intro': 'Press <b>Z</b> to idle-farm: your character fights on its own around the spot where you switched it on, and will not wander off.',
  'help.auto.skill': 'Cast skills automatically',
  'help.auto.potion': 'Drink Red Potions automatically',
  'help.auto.below': 'when Health drops below',
  'help.auto.range': 'Scan radius around the anchor',
  'help.auto.boss': 'Attack Bosses too',
  'help.auto.open': 'Change these in Settings',
};
