/**
 * All dialogue data for the Gearbreakers MVP.
 * Each key maps to an array of dialogue nodes: { speaker, text }
 */

export const DIALOGUE = {

  // ─── Opening: Grizzle gives the Slagworks quest ───

  grizzle_intro: [
    { speaker: 'Grizzle', text: 'Well, well. The four scrappiest outcasts in the Rustlands, all under my roof. Must be my lucky day.' },
    { speaker: 'Rook', text: 'Lucky? We\'re the best thing that ever happened to this dump.' },
    { speaker: 'Sable', text: '...Your sign fell off the building again.' },
    { speaker: 'Grizzle', text: 'Listen up. The old Slagworks refinery east of town -- there\'s a working Aether Converter buried in there. We need it.' },
    { speaker: 'Pip', text: 'A working Aether Converter? Oh, I could do so many beautiful, horrible things with one of those!' },
    { speaker: 'Vesper', text: 'By "beautiful, horrible things" she means blow us all up. For the record, I\'ve already seen three ways I die today.' },
    { speaker: 'Grizzle', text: 'The Slagworks is crawling with rogue machines. The old foreman -- some junkheap called Furnace Rex -- still runs the place. Shut him down, grab the Converter, get out.' },
    { speaker: 'Rook', text: 'Easy money. Let\'s roll before someone competent shows up and takes the job.' },
  ],

  // ─── After clearing Slagworks ───

  grizzle_post_slagworks: [
    { speaker: 'Grizzle', text: 'You actually did it. I\'d clap, but...' },
    { speaker: 'Sable', text: 'One arm. We noticed.' },
    { speaker: 'Grizzle', text: 'Bad news. While you were playing in the furnace, someone opened the Undercroft. The old tunnels beneath the town. Something down there is waking up.' },
    { speaker: 'Vesper', text: 'I can feel it. Like static behind my eyes. Whatever\'s down there, it\'s been waiting a long time.' },
    { speaker: 'Pip', text: 'Ooh, ancient evil! Do we get hazard pay for ancient evil?' },
    { speaker: 'Grizzle', text: 'You get to keep breathing. There\'s a warden at the bottom -- Kael. Used to be human. Key word: used to. Shut that place down before whatever he\'s guarding gets loose.' },
  ],

  // ─── Ticker's shop greeting ───

  ticker_intro: [
    { speaker: 'Ticker', text: 'Don\'t -- don\'t touch anything! Everything is where it -- where I put it! You buying or just breathing my air?' },
    { speaker: 'Rook', text: 'Relax, Ticker. We just need supplies.' },
    { speaker: 'Ticker', text: 'Supplies. Right. Scrap up front, no refunds, no returns, no -- no eye contact. I\'ve got stims, cells, the usual.' },
    { speaker: 'Sable', text: 'We\'ll take what we need. Try not to vibrate out of your skin while we browse.' },
  ],

  // ─── Ticker after Slagworks ───

  ticker_post_slagworks: [
    { speaker: 'Ticker', text: 'You cleared the Slagworks? You -- really? New stock, then. Got some salvage from the, uh, from the tunnels. Don\'t ask where.' },
    { speaker: 'Pip', text: 'Is that a plasma driver? Ticker, you beautiful paranoid disaster.' },
    { speaker: 'Ticker', text: 'No touching until you -- until you pay! And stop smiling, it\'s unsettling.' },
  ],

  // ─── Townsfolk flavor text ───

  townsfolk_1: [
    { speaker: 'Settler', text: 'Used to be a proper town here, before the machines went feral. Now we just patch things together and hope.' },
    { speaker: 'Settler', text: 'If you\'re headed to the Slagworks, watch for the vents. Saw a man get cooked alive in there. Well, half-cooked. He\'s still around somewhere.' },
  ],

  townsfolk_2: [
    { speaker: 'Scavenger', text: 'You lot are the ones working for Grizzle? Better you than me. That man attracts trouble like rust attracts rain.' },
    { speaker: 'Scavenger', text: 'Word of advice: if something clicks in the dark, don\'t wait to see what it is. Just run.' },
  ],

  townsfolk_3: [
    { speaker: 'Mechanic', text: 'The Aether Converters were supposed to save us. Clean energy, unlimited power, bright future, all that garbage.' },
    { speaker: 'Mechanic', text: 'Then they started pulling things through from the other side. Turns out unlimited power has a real ugly price tag.' },
  ],

  townsfolk_4: [
    { speaker: 'Old Timer', text: 'I remember when this was all fields. Well, not fields. Wasteland. But nicer wasteland.' },
    { speaker: 'Old Timer', text: 'Now every scrapheap\'s got something living in it. And I use the word "living" loosely.' },
    { speaker: 'Old Timer', text: 'You kids be careful out there. Or don\'t. Makes no difference to me.' },
  ],

  // ─── Slagworks environmental logs ───

  slagworks_log_1: [
    { speaker: '[Maintenance Log]', text: 'Day 47: Furnace Rex unit is exhibiting non-standard behavior. Keeps arranging scrap into patterns. Probably nothing.' },
    { speaker: '[Maintenance Log]', text: 'Day 48: Correction. Rex welded the safety team into a sculpture. Requesting immediate shutdown authorization.' },
  ],

  slagworks_log_2: [
    { speaker: '[Personal Terminal]', text: 'If anyone finds this: the Converter is in sublevel 3, behind the blast door. Access code was my daughter\'s birthday. I can\'t remember it anymore.' },
    { speaker: '[Personal Terminal]', text: 'The fumes are getting worse. Machines don\'t need air. We do. Funny how that works out.' },
  ],

  // ─── Furnace Rex pre-fight ───

  furnace_rex_pre: [
    { speaker: 'Furnace Rex', text: 'INTRUDERS. IN. MY. FORGE.' },
    { speaker: 'Rook', text: 'Called it. Big, angry, and on fire. My favorite combination.' },
    { speaker: 'Furnace Rex', text: 'THIS METAL IS MINE. THESE FIRES ARE MINE. YOU WILL BE MADE INTO SOMETHING... USEFUL.' },
  ],

  // ─── Warden Kael pre-fight ───

  kael_pre: [
    { speaker: 'Kael', text: 'You should not have come here. This place was sealed for a reason.' },
    { speaker: 'Vesper', text: 'You\'re the warden. Kael. You were human once.' },
    { speaker: 'Kael', text: 'Once. Before I understood what needed guarding. The things behind this door do not sleep. They wait.' },
    { speaker: 'Sable', text: 'We\'re shutting this down, Kael. Step aside or we go through you.' },
    { speaker: 'Kael', text: 'I have waited centuries for someone to say that. Forgive me for what comes next.' },
  ],

  // ─── After defeating Kael ───

  kael_post: [
    { speaker: 'Kael', text: 'It is... done. The seal holds. For now.' },
    { speaker: 'Vesper', text: 'What\'s behind the door, Kael? What were you really guarding?' },
    { speaker: 'Kael', text: 'Something older than the Rustlands. Older than the Converters. It has many names. None of them kind. You have earned... a warning. It knows your faces now.' },
    { speaker: 'Pip', text: 'Great. Ancient evil knows our faces. That\'s going on the resume.' },
  ],

  // ─── Ending: back in town, cliffhanger ───

  ending: [
    { speaker: 'Grizzle', text: 'The Undercroft is sealed. Kael\'s down. I\'d say drinks are on the house, but I still need to eat.' },
    { speaker: 'Rook', text: 'So what now? We saved the town, beat the monsters, look incredibly good doing it. Story\'s over, right?' },
    { speaker: 'Vesper', text: 'No. It\'s not. I can see something coming. The Converters across the Rustlands -- they\'re all activating. Every single one.' },
    { speaker: 'Sable', text: 'How many are there?' },
    { speaker: 'Vesper', text: 'Hundreds. And whatever Kael was guarding... it\'s sending out a signal. Calling them home.' },
    { speaker: 'Grizzle', text: 'Then I guess you four aren\'t retired yet. Get some rest. Something tells me the real fight hasn\'t started.' },
  ],
};
