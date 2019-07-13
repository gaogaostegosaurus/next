"use strict";

actionList.nin = [

  // Single Target
  "Gust Slash", "Aeolian Edge", "Armor Crush"
  "Raiton", "Bhavacakra", "Hyosho Ranyu"

  // AoE
  "Death Blossom", "Hakke Mujinsatsu",
  "Katon","Goka Mekkyaku", "Doton",

  // Other
  "Spinning Edge", "Shadow Fang", "Throwing Dagger",
  "Ten", "Chi", "Jin", "Fuma Shuriken", "Hyoton", "Huton", "Suiton",
  "Hellfrog Medium",
  "Hide", "Mug", "Trick Attack", "Kassatsu", "Dream Within a Dream",
  "Assassinate", "Ten Chi Jin",

  // Role
  "True North"
];

function ninJobChange() {

  id.ninjutsu = 0;
  id.mudra1 = 1;
  id.mudra2 = 2;
  id.mudra3 = 3;
  id.spinningedge = 4;
  id.deathblossom = id.spinningedge;
  id.gustslash = 5;
  id.aeolianedge = 6;
  id.armorcrush = id.aeolianedge;
  id.shadowfang = id.aeolianedge;
  id.hakkemujinsatsu = id.spinningedge;
  id.trickattack = 10;
  id.dreamwithinadream = 11;
  id.assassinate = 12;
  id.hellfrogmedium = 13;
  id.bhavacakra = id.hellfrogmedium;
  id.tenchijin = 12;

  count.aoe = 1;
  previous.deathblossom = 0;
  previous.hakkemujinsatsu = 0;
  previous.katon = 0; // Includes Goka Mekkyaku
  previous.hellfrogmedium = 0;

  ninCombo();

}

function ninAction(logLine) {

  // AoE Toggle
  if (["Gust Slash", "Aeolian Edge", "Armor Crush"
  "Raiton", "Bhavacakra"].indexOf(actionGroups.actionname) > -1) {
    count.aoe = 1;
  }

  // Mudra first because doing anything else breaks the "combo"

  if ("Ten" == actionGroups.actionname) {
    toggle.mudra = toggle.mudra + "T";
    ninMudraCombo();
  }
  else if ("Chi" == actionGroups.actionname) {
    toggle.mudra = toggle.mudra + "C";
    ninMudraCombo();
  }
  else if ("Jin" == actionGroups.actionname) {
    toggle.mudra = toggle.mudra + "J";
    ninMudraCombo();
  }

  else {

    delete toggle.mudra;
    clearTimeout(timeout.mudra);

    if ("Hide" == actionGroups.actionname) {
      addCooldown("hide", player.ID, recast.hide);
      addCooldown("ninjutsu", player.ID, -1);
      ninJutsu();
    }

    else if ("Mug" == actionGroups.actionname) {
      removeIcon(id.mug);
      addCooldown("mug", player.ID, recast.mug);
      ninKi();
    }

    else if ("Trick Attack" == actionGroups.actionname) {
      removeIcon(id.trickattack);
      clearTimeout(timeout.trickattack);
      addCooldown("trickattack", player.ID, recast.trickattack);
    }

    else if ("Suiton" == actionGroups.actionname) {
      addIconBlinkTimeout("trickattack", checkCooldown("trickattack", player.ID), id.trickattack, icon.trickattack);
    }

    else if (["Katon", "Goka Mekkyaku"].indexOf(actionGroups.actionname) > -1) {
      if (Date.now() - previous.katon > 1000) {
        previous.katon = Date.now()
        count.aoe = 1;
      }
      else {
        count.aoe = count.aoe + 1;
      }
    }

    else if ("Kassatsu" == actionGroups.actionname) {

      if (checkCooldown("kassatsu2", player.ID) < 0) {
        addCooldown("kassatsu2", player.ID, recast.kassatsu);
        addCooldown("kassatsu1", player.ID, -1);
      }

      else {
        removeIcon(id.kassatsu);
        addCooldown("kassatsu1", player.ID, checkCooldown("kassatsu2", player.ID));
        addCooldown("kassatsu2", player.ID, checkCooldown("kassatsu2", player.ID) + recast.kassatsu);
        addIconBlinkTimeout("kassatsu", checkCooldown("kassatsu1", player.ID), id.kassatsu, icon.kassatsu);
      }

      addStatus("kassatsu", player.ID, duration.kassatsu);
      ninNinjutsu();
    }

    else if ("Dream Within A Dream" == actionGroups.actionname) {
      addCooldown("dreamwithinadream", player.ID, recast.dreamwithinadream);
      addStatus("assassinateready", player.ID, duration.assassinateready);
      addIconBlinkTimeout("dreamwithinadream", recast.dreamwithinadream, id.dreamwithinadream, icon.dreamwithinadream);
    }

    else if ("Hellfrog Medium" == actionGroups.actionname) {
      if (Date.now() - previous.hellfrogmedium > 1000) {
        previous.hellfrogmedium = Date.now()
        count.aoe = 1;
      }
      else {
        count.aoe = count.aoe + 1;
      }
      removeIcon(id.hellfrogmedium);
    }

    else if ("Bhavacakra" == actionGroups.actionname) {
      removeIcon(id.bhavacakra);
    }

    else if ("Ten Chi Jin" == actionGroups.actionname) {
      removeIcon(id.tenchijin);
      addCooldown("tenchijin", player.ID, recast.tenchijin);
      addCooldown("ninjutsu", player.ID, -1);
      addStatus("tenchijin", player.ID, duration.tenchijin);
      ninJutsu();
    }

    // Combos

    else if ("Spinning Edge" == actionGroups.actionname
    && actionGroups.result.length >= 2) {
      if (!next.combo) {
        ninCombo();
      }
      removeIcon(id.spinningedge);
    }

    else if ("Gust Slash" == actionGroups.actionname && actionGroups.result.length >= 8) {
      removeIcon(id.spinningedge);
      removeIcon(id.gustslash);
      if (player.level < 26) {
        ninCombo();
      }
    }

    else if ("Shadow Fang" == actionGroups.actionname && actionGroups.result.length >= 8) {
      addStatus("shadowfang", actionGroups.targetID, duration.shadowfang);
      ninCombo();
    }

    else if ("Death Blossom" == actionGroups.actionname
    && actionGroups.result.length >= 2) {
      if (Date.now() - previous.deathblossom > 1000) {
        previous.deathblossom = Date.now()
        count.aoe = 1;
      }
      else {
        count.aoe = count.aoe + 1;
      }
      ninCombo();
      removeIcon(id.deathblossom);
      if (player.level < 52) {
        ninCombo();
      }
    }

    else if ("Hakke Mujinsatsu" == actionGroups.actionname
    && actionGroups.result.length == 8) {
      if (Date.now() - previous.hakkemujinsatsu > 1000) {
        previous.hakkemujinsatsu = Date.now()
        count.aoe = 1;
      }
      else {
        count.aoe = count.aoe + 1;
      }
      ninCombo();
    }

    else {
      ninCombo();
    }
  }
}

function ninStatus() {

  if (statusGroups.targetID == player.ID) {

    if ("Mudra" == statusGroups.statusname) {
      if ("gains" == statusGroups.gainsloses) {
        addStatus("mudra", statusGroups.targetID, parseInt(statusGroups.duration) * 1000);
      }
      else if ("loses" == statusGroups.gainsloses) {
        removeStatus("mudra", player.ID);
        addCooldown("ninjutsu", statusGroups.targetID, recast.ninjutsu);
      }
    }

    else if ("Doton" == statusGroups.statusname) {
      if ("gains" == statusGroups.gainsloses) {
        addStatus("doton", statusGroups.targetID, parseInt(statusGroups.duration) * 1000);
      }
      else if ("loses" == statusGroups.gainsloses) {
        removeStatus("doton", statusGroups.targetID);
      }
    }

    else if ("Suiton" == statusGroups.statusname) {
      if ("gains" == statusGroups.gainsloses) {
        addStatus("suiton", statusGroups.targetID, parseInt(statusGroups.duration) * 1000);
      }
      else if ("loses" == statusGroups.gainsloses) {
        clearTimeout(timeout.trickattack);
        removeIcon(id.trickattack, icon.trickattack);
        removeStatus("suiton", statusGroups.targetID);
      }
    }

    else if ("Kassatsu" == statusGroups.statusname) {
      if ("gains" == statusGroups.gainsloses) {
        addStatus("kassatsu", statusGroups.targetID, parseInt(statusGroups.duration) * 1000);
      }
      else if ("loses" == statusGroups.gainsloses) {
        removeStatus("kassatsu", statusGroups.targetID);
      }
    }

    else if ("Ten Chi Jin" == statusGroups.statusname) {
      if ("gains" == statusGroups.gainsloses) {
        addStatus("tenchijin", statusGroups.targetID, parseInt(statusGroups.duration) * 1000);
      }
      else if ("loses" == statusGroups.gainsloses) {
        removeStatus("tenchijin", statusGroups.targetID);
        addCooldown("ninjutsu", statusGroups.targetID, recast.ninjutsu);
      }
    }
  }

  else {
    if ("Shadow Fang" == statusGroups.statusname) {
      if ("gains" == statusGroups.gainsloses) {
        addStatus("shadowfang", statusGroups.targetID, parseInt(statusGroups.duration) * 1000);
      }
      else if ("loses" == statusGroups.gainsloses) {
        removeStatus("shadowfang", statusGroups.targetID);
      }
    }
  }
}

function ninCombo() {

  if (player.level >= 54
  && count.aoe <= 2
  && player.jobDetail.hutonMilliseconds > 0
  && player.jobDetail.hutonMilliseconds < 35000) {
    next.combo = 3;
    ninArmorCrushCombo();
  }
  else if (player.level >= 38
  && count.aoe <= 3
  && checkStatus("shadowfang", target.ID) < 9000) {
    next.combo = 2;
    ninShadowFangCombo();
  }
  else if (count.aoe >= 3) {
    next.combo = 4;
    ninHakkeMujinsatsuCombo();
  }
  else {
    next.combo = 1;
    ninAeolianEdgeCombo();
  }
}

ninAeolianEdgeCombo() {
  addIcon(id.spinningedge, icon.spinningedge);
  if (player.level >= 4) {
    addIcon(id.gustslash, icon.gustslash);
  }
  if (player.level >= 26) {
    addIcon(id.aeolianedge, icon.aeolianedge);
  }
}

ninShadowFangCombo() {
  addIcon(id.spinningedge, icon.spinningedge);
  addIcon(id.shadowfang, icon.shadowfang);
}

ninArmorCrushCombo() {
  addIcon(id.spinningedge, icon.spinningedge);
  addIcon(id.gustslash, icon.gustslash);
  addIcon(id.armorcrush, icon.armorcrush);
}

ninHakkeMujinsatsuCombo() {
  addIcon(id.deathblossom, icon.deathblossom);
  if (player.level >= 52) {
    addIcon(id.hakkemujinsatsu, icon.hakkemujinsatsu);
  }
}

function ninJutsu() { // Activate between GCDs?

  if (player.level >= 45
  && player.jobDetail.hutonMilliseconds == 0) {
    // Huton
  }
  else if (player.level >= 45
  && checkCooldown("sneakattack", player.ID) < 22500) {
    // Suiton
  }
  else if (player.level >= 45
  && player.level < 54
  && player.jobDetail.hutonMilliseconds < 22500) {
    // Huton
  }
  else if (player.level >= 35
  && toggle.aoe) {
    // Katon / Goka Mekkyaku
  }
  else if (checkStatus("kassatsu", player.ID) > 2500) {
    // Hyosho Ranyu
  }
  else if (player.level >= 35) {
    // Raiton
  }
  else if (player.level >= 30) {
    // Fuma Shuriken
  }
}

function ninMudraCombo() {

  if (checkStatus("kassatsu", player.ID) > 5000) {
    icon.katon = icon.gokamekkyaku;
    icon.hyoton = icon.hyoshoranyu;
  }
  else {
    icon.katon = "002908";
    icon.hyoton = "002909";
  }

  if (toggle.mudra.length == 1) {
    // Fuma Shuriken
  }
  else if (["CT", "JT"].indexOf(toggle.mudra) > -1) {
    // Katon
  }
  else if (["TC", "JC"].indexOf(toggle.mudra) > -1) {
    // Raiton
  }
  else if (["TJ", "CJ"].indexOf(toggle.mudra) > -1) {
    // Hyoton
  }
  else if (["JCT", "CJT"].indexOf(toggle.mudra) > -1) {
    // Huton
  }
  else if (["TJC", "JTC"].indexOf(toggle.mudra) > -1) {
    // Doton
  }
  else if (["TCJ", "CTJ"].indexOf(toggle.mudra) > -1) {
    // Suiton
  }
  else {
    // Rabbit
  }
}

function ninMudraComboTimeout() {
  clearTimeout(timeout.mudra);
  timeout.mudra = setTimeout(ninJutsuRabbitMedium, 20000);
}

function ninKi() {

  // Since NIN gains ninki based on weaponskills now, can just run this function after weaponskills
  if (player.jobDetail.ninkiAmount >= 80) {

    if (player.level >= 80
    && checkCooldown("bunshin", player.ID) < 0) {
      addIcon(id.bunshin,icon.bunshin);
    }
    else if (toggle.aoe || count.aoe > 1) {
      addIcon(id.hellfrogmedium,icon.hellfrogmedium);
    }
    else if (player.level >= 68) {
      addIcon(id.bhavacakra,icon.bhavacakra);
    }
    else {
      addIcon(id.hellfrogmedium,icon.hellfrogmedium);
    }
  }
  else {
    removeIcon(id.hellfrogmedium);
  }
}
