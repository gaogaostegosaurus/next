"use strict";

// Define actions to watch for

actionList.war = [

  // Role actions
  "Rampart", "Arm\'s Length",

  // AoE actions
  "Overpower", "Mythril Tempest", "Steel Cyclone", "Decimate",

  // Single target actions
  "Storm\'s Path", "Fell Cleave", "Inner Chaos",

  // AoE or single target depending on level
  "Inner Beast", "Chaotic Cyclone",

  // Everything else
  "Heavy Swing", "Maim", "Storm\'s Eye", "Tomahawk",
  "Berserk", "Thrill Of Battle", "Vengeance", "Holmgang", "Infuriate", "Raw Intuition", "Upheaval", "Inner Release", "Nascent Flash"

];

// Don't need to check these actions... yet?
// "Onslaught", "Equilibrium", "Shake It Off",
// "Low Blow", "Provoke", "Interject", "Reprisal", "Shirk",

function warJobChange() {

  nextid.mitigation = 0;
  nextid.vengeance = nextid.mitigation;
  nextid.rawintuition = nextid.mitigation;
  nextid.rampart = nextid.mitigation;
  nextid.innerbeast = 1;
  nextid.steelcyclone = nextid.innerbeast;
  nextid.fellcleave = nextid.innerbeast;
  nextid.decimate = nextid.innerbeast;
  nextid.chaoticcyclone = nextid.innerbeast;
  nextid.innerchaos = nextid.innerbeast;
  nextid.heavyswing = 2;
  nextid.overpower = nextid.heavyswing;
  nextid.maim = 3;
  nextid.stormspath = 4;
  nextid.stormseye = nextid.stormspath;
  nextid.mythriltempest = nextid.stormspath;
  nextid.infuriate = 10;
  nextid.berserk = 11;
  nextid.innerrelease = nextid.berserk;
  nextid.upheaval = nextid.berserk;

  previous.overpower = 0;
  previous.mythriltempest = 0;
  previous.steelcyclone = 0;

  if (player.level >= 54) {
    icon.innerbeast = icon.fellcleave;
  }
  else {
    icon.innerbeast = "002553";
  }

  if (player.level >= 60) {
    icon.steelcyclone = icon.decimate;
  }
  else {
    icon.steelcyclone = "002552";
  }

  if (player.level >= 70) {
    icon.berserk = icon.innerrelease;
  }
  else {
    icon.berserk = "000259";
  }

  if (enemyTargets > 1) {
    if (player.level >= 56
    && checkRecast("rawintuition") < 0) {
      addIcon("rawintuition");
    }
    else if (player.level >= 8
    && checkRecast("rampart") < 0) {
      addIcon("rampart");
    }
    else if (player.level >= 46
    && checkRecast("vengeance") < 0) {
      addIcon("vengeance");
    }
  }

  if (player.level >= 50
  && checkRecast("infuriate1", player.ID) < 0) {
    addIcon("infuriate");
  }

  // Berserk is complicated
  if (player.level >= 64
  && checkRecast("upheaval") < 0
  && checkRecast("berserk") > 25000 ) {
    addIcon("upheaval"); // Show Upheaval if Berserk is far away
  }
  else if (player.level >= 74
  && checkRecast("infuriate1", player.ID) < 0) {
    removeIcon("berserk"); // Hide Berserk to prevent wasting Nascent Chaos
  }
  else if (player.level >= 6
  && checkRecast("berserk") < 0) {
    addIcon("berserk");
  }

  warCombo();
  warGauge();
}

function warAction() {

  if (actionList.war.indexOf(actionLog.groups.actionName) > -1) {


    // These actions don't break combo

    if (["Berserk", "Inner Release"].indexOf(actionLog.groups.actionName) > -1) {
      removeIcon("berserk");
      addStatus("berserk", duration.berserk, actionLog.groups.targetID);
      addRecast("berserk");
      addIconBlinkTimeout("berserk",recast.berserk,nextid.berserk,icon.berserk);
      if (player.level >= 70) {
        warGauge(); // Triggers gauge stuff for Inner Release
      }
    }

    else if ("Upheaval" == actionLog.groups.actionName) {
      removeIcon("upheaval");
      addRecast("upheaval");
      warGauge();
    }

    else if ("Infuriate" == actionLog.groups.actionName) { // Code treats Infuriate like two different skills to juggle the charges.
      if (checkRecast("infuriate2", player.ID) < 0) {
        addRecast("infuriate1", player.ID, -1);
        addRecast("infuriate2", player.ID, recast.infuriate);
      }
      else {
        removeIcon("infuriate");
        addRecast("infuriate1", player.ID, checkRecast("infuriate2", player.ID));
        addRecast("infuriate2", player.ID, checkRecast("infuriate2", player.ID) + recast.infuriate);
        addIconBlinkTimeout("infuriate", checkRecast("infuriate1", player.ID), nextid.infuriate, icon.infuriate);
      }
      warGauge();
    }

    else if ("Raw Intuition" == actionLog.groups.actionName) {
      addRecast("rawintuition");
      removeIcon("rawintuition");
    }

    else if ("Rampart" == actionLog.groups.actionName) {
      addRecast("rampart");
      removeIcon("rampart");
    }

    else if ("Vengeance" == actionLog.groups.actionName) {
      addRecast("vengeance");
      removeIcon("vengeance");
    }

    else { // GCD actions

      if (["Inner Beast", "Fell Cleave", "Inner Chaos"].indexOf(actionLog.groups.actionName) > -1) {
        if (player.level >= 45
        && player.level < 54) {
          enemyTargets = 1; // Steel Cyclone is stronger than Inner Beast at 2+ targets
        }
        if (player.level >= 66) { // Enhanced Infuriate
          addRecast("infuriate1", player.ID, checkRecast("infuriate1", player.ID) - 5000);
          addRecast("infuriate2", player.ID, checkRecast("infuriate2", player.ID) - 5000);
          removeIcon("infuriate");
          addIconBlinkTimeout("infuriate",checkRecast("infuriate1", player.ID),nextid.infuriate,icon.infuriate);
        }
        removeIcon("innerbeast");
      }

      else if (["Steel Cyclone", "Decimate", "Chaotic Cyclone"].indexOf(actionLog.groups.actionName) > -1) {
        if (Date.now() - previous.steelcyclone > 1000) {
          enemyTargets = 1;
          previous.steelcyclone = Date.now();
          if (player.level >= 66) { // Enhanced Infuriate
            addRecast("infuriate1", player.ID, checkRecast("infuriate1", player.ID) - 5000);
            addRecast("infuriate2", player.ID, checkRecast("infuriate2", player.ID) - 5000);
            removeIcon("infuriate");
            addIconBlinkTimeout("infuriate",checkRecast("infuriate1", player.ID),nextid.infuriate,icon.infuriate);
          }
        }
        else {
          enemyTargets = enemyTargets + 1;
        }
        removeIcon("innerbeast");
      }

      // These actions affect combo

      else if ("Heavy Swing" == actionLog.groups.actionName
      && actionLog.groups.result.length >= 2) {
        enemyTargets = 1;
        if ([1, 2].indexOf(next.combo) == -1) {
          warCombo();
          toggle.combo = Date.now();
        }
        removeIcon("heavyswing");
        if (player.level >= 4) {
          warComboTimeout();
        }
        else {
          warCombo();
        }
      }

      else if ("Maim" == actionLog.groups.actionName
      && actionLog.groups.result.length >= 8) {
        removeIcon("heavyswing");
        removeIcon("maim");
        if (player.level >= 26) {
          warComboTimeout();
        }
        else {
          warCombo();
        }
      }

      else if ("Storm's Path" == actionLog.groups.actionName
      && actionLog.groups.result.length >= 8) {
        warCombo();
      }

      else if ("Storm's Eye" == actionLog.groups.actionName
      && actionLog.groups.result.length >= 8) {
        addStatus("stormseye");
        warCombo();
      }

      else if ("Overpower" == actionLog.groups.actionName
      && actionLog.groups.result.length >= 2) {
        if (Date.now() - previous.overpower > 1000) {
          previous.overpower = Date.now();
          enemyTargets = 1;
        }
        else {
          enemyTargets = enemyTargets + 1;
        }
        if (next.combo != 3) {
          warCombo();
          toggle.combo = Date.now();
        }
        removeIcon("overpower");
        if (player.level >= 40) {
          warComboTimeout();
        }
        else {
          warCombo();
        }
      }

      else if ("Mythril Tempest" == actionLog.groups.actionName
      && actionLog.groups.result.length >= 8) {

        if (Date.now() - previous.mythriltempest > 1000) {
          previous.mythriltempest = Date.now();
          enemyTargets = 1;
          if (checkStatus("stormseye", player.ID) > 0) {
            addStatus("stormseye", Math.min(checkStatus("stormseye", player.ID) + 10000, duration.stormseye));
          }
        }
        else {
          enemyTargets = enemyTargets + 1;
        }
        warCombo();
      }

      else {
        warCombo();
      }

      if (enemyTargets >= 3
      && checkStatus("mitigation", effectLog.groups.targetID) < 1000) {
        warMitigation();
      }
      else {
        removeIcon("rampart");
      }

      warGauge(); // Check gauge after all GCD actions
    }
  }
}

function warStatus() {

  if (effectLog.groups.targetID == player.ID) { // Target is self

    if (["Berserk", "Inner Release"].indexOf(effectLog.groups.effectName) > -1) {
      if (effectLog.groups.gainsLoses == "gains") {
        addStatus("berserk", parseInt(effectLog.groups.effectDuration) * 1000, effectLog.groups.targetID);
        if (checkRecast("upheaval") < parseInt(effectLog.groups.effectDuration) * 1000) {
          addIconBlinkTimeout("upheaval", checkRecast("upheaval"), nextid.upheaval, icon.upheaval); // Show Upheaval if up during Berserk
        }
      }
      else if (effectLog.groups.gainsLoses == "loses") {
        removeStatus("berserk", effectLog.groups.targetID);
      }

      if ("Inner Release" == effectLog.groups.effectName) {
        warGauge();
      }
    }


    else if ("Storm's Eye" == effectLog.groups.effectName) {
      if (effectLog.groups.gainsLoses == "gains") {
        addStatus("stormseye", parseInt(effectLog.groups.effectDuration) * 1000, effectLog.groups.targetID);
      }
      else if (effectLog.groups.gainsLoses == "loses") {
        removeStatus("stormseye", effectLog.groups.targetID);
      }
    }

    else if ("Raw Intuition" == effectLog.groups.effectName) {
      if (effectLog.groups.gainsLoses == "gains") {
        if (checkStatus("mitigation", effectLog.groups.targetID) < parseInt(effectLog.groups.effectDuration) * 1000) {
          addStatus("mitigation", parseInt(effectLog.groups.effectDuration) * 1000, effectLog.groups.targetID);
        }
      }
      else if (effectLog.groups.gainsLoses == "loses") {
        if (checkStatus("mitigation", effectLog.groups.targetID) < 0
        && enemyTargets >= 3) {
          warMitigation();
        }
      }
    }

    else if ("Rampart" == effectLog.groups.effectName) {
      if (effectLog.groups.gainsLoses == "gains") {
        if (checkStatus("mitigation", effectLog.groups.targetID) < parseInt(effectLog.groups.effectDuration) * 1000) {
          addStatus("mitigation", parseInt(effectLog.groups.effectDuration) * 1000, effectLog.groups.targetID);
        }
      }
      else if (effectLog.groups.gainsLoses == "loses") {
        if (checkStatus("mitigation", effectLog.groups.targetID) < 0 // Check for overlaps
        && enemyTargets >= 3) {
          warMitigation();
        }
      }
    }

    else if ("Vengeance" == effectLog.groups.effectName) {
      if (effectLog.groups.gainsLoses == "gains") {
        if (checkStatus("mitigation", effectLog.groups.targetID) < parseInt(effectLog.groups.effectDuration) * 1000) {
          addStatus("mitigation", parseInt(effectLog.groups.effectDuration) * 1000, effectLog.groups.targetID);
        }
      }
      else if (effectLog.groups.gainsLoses == "loses") {
        if (checkStatus("mitigation", effectLog.groups.targetID) < 0
        && enemyTargets >= 3) {
          warMitigation();
        }
      }
    }

    else if ("Nascent Chaos" == effectLog.groups.effectName) {
      if (effectLog.groups.gainsLoses == "gains") {
        addStatus("nascentchaos", parseInt(effectLog.groups.effectDuration) * 1000, effectLog.groups.targetID);
        removeIcon("berserk");
      }
      else if (effectLog.groups.gainsLoses == "loses") {
        removeStatus("nascentchaos", effectLog.groups.targetID);
        addIconBlinkTimeout("berserk",checkRecast("berserk"),nextid.berserk,icon.berserk);
      }
      warGauge()
    }
  }
}


function warMitigation() {

  // Shows next mitigation cooldown
  // Ideally Vengeance > Raw Intuition > Rampart > Raw Intuition > DPS plz wake up and DPS

  if (player.level >= 56) {
    if (checkRecast("vengeance") <= Math.min(checkRecast("rampart"), checkRecast("rawintuition"))) {
      addIconBlinkTimeout("mitigation",checkRecast("vengeance"),nextid.mitigation,icon.vengeance);
    }
    else if (checkRecast("rawintuition") <= Math.min(checkRecast("rampart"), checkRecast("vengeance"))) {
      addIconBlinkTimeout("mitigation",checkRecast("rawintuition"),nextid.mitigation,icon.rawintuition);
    }
    else if (checkRecast("rampart") <= Math.min(checkRecast("vengeance"), checkRecast("rawintuition"))) {
      addIconBlinkTimeout("mitigation",checkRecast("rampart"),nextid.mitigation,icon.rampart);
    }
  }

  else if (player.level >= 46) {
    if (checkRecast("vengeance") <= checkRecast("rampart")) {
      addIconBlinkTimeout("mitigation",checkRecast("vengeance"),nextid.mitigation,icon.vengeance);
    }
    else if (checkRecast("rampart") <= checkRecast("vengeance")) {
      addIconBlinkTimeout("mitigation",checkRecast("rampart"),nextid.mitigation,icon.rampart);
    }
  }

  else if (player.level >= 8) {
    addIconBlinkTimeout("mitigation",checkRecast("rampart"),nextid.mitigation,icon.rampart);
  }
}

function warGauge() {

  let targetbeast = 50; // Display spender icon if Beast is this value or above

  // Set Inner Beast icon - listed from highest to lowest minimum potency
  if (checkStatus("nascentchaos", player.ID) > 2500) {
    if (enemyTargets >= 3) {
      icon.innerbeast = icon.chaoticcyclone;
    }
    if (player.level >= 80) {
      icon.innerbeast = icon.innerchaos;
    }
    else if (player.level >= 74) {
      icon.innerbeast = icon.chaoticcyclone; // Use Cyclone on Single Target before 80? Not sure...
    }
  }
  else if (player.level >= 60
  && enemyTargets >= 3) {
    icon.innerbeast = icon.decimate;
  }
  else if (player.level >= 45
  && enemyTargets >= 3) {
    icon.innerbeast = icon.steelcyclone;
  }
  else if (player.level >= 54) {
    icon.innerbeast = icon.fellcleave;
  }
  else if (player.level >= 45
  && player.level < 54
  && enemyTargets >= 2) {
    icon.innerbeast = icon.steelcyclone;
  }
  else {
    icon.innerbeast = "002553";
  }

  // Set Steel Cyclone icon
  if (checkStatus("nascentchaos", player.ID) > 2500) {
    icon.steelcyclone = icon.chaoticcyclone;
  }
  else if (player.level >= 60) {
    icon.steelcyclone = icon.decimate;
  }
  else {
    icon.steelcyclone = "002552";
  }

  if (player.level >= 70
  && checkStatus("berserk", player.ID) > 0) { // Possibly adjust this number
    targetbeast = 0; // Spam during Inner Release
  }
  else if (player.level >= 70
  && checkRecast("berserk") < 5000
  && checkRecast("infuriate1", player.ID) < 40000) {
    targetbeast = 50; // Avoid overcapping during Inner Release
  }
  else if (player.level >= 66
  && checkRecast("infuriate1", player.ID) < 10000) {
    targetbeast = 50; // Avoid overcapping from Enhanced Infuriate
  }
  else if (player.level < 66
  && checkRecast("infuriate1", player.ID) < 5000) {
    targetbeast = 50; // Avoid overcapping from Infuriate
  }
  else if (player.level >= 74
  && checkStatus("nascentchaos", player.ID) > 2500
  && checkStatus("nascentchaos", player.ID) < 12500) {
    targetbeast = 50; // Avoid wasting Nascent Chaos
  }
  else if (player.level >= 50
  && enemyTargets <= 3 // AoE wins at 3
  && checkStatus("stormseye", player.ID) < 15000) {
    targetbeast = 90; // Avoid letting Storm's Eye fall off during AoE
  }
  else if (player.level >= 50
  && checkStatus("stormseye", player.ID) < 5000) {
    targetbeast = 90; // Avoid using spenders out of Storm's Eye
  }
  else if (player.level >= 45
  && enemyTargets >= 3) {
    targetbeast = 50; // Use AoE
  }
  else if (player.level >= 64
  && checkRecast("upheaval") < 20000) { // Revisit if too conservative
    targetbeast = 70; // Stay above 20 for Upheavals
  }
  else {
    targetbeast = 50; // All other cases
  }

  // Berserk/Inner Release
  if (checkRecast("berserk") < 0
  && checkStatus("stormseye", player.ID) > 0) {
    addIcon("berserk");
  }
  else if (player.level >= 70
  && checkRecast("upheaval") < 1000
  && checkStatus("berserk", player.ID) > 0) {
    addIcon("upheaval");
  }
  else if (player.level >= 64
  && player.jobDetail.beast >= 20
  && checkRecast("upheaval") < 1000
  && checkRecast("berserk") > 25000) {
    addIcon("upheaval");
  }
  else {
    removeIcon("upheaval");
  }

  if (player.level >= 35
  && player.jobDetail.beast >= targetbeast) {
    addIcon("innerbeast");
  }
  else {
    removeIcon("innerbeast");
  }
}

function warCombo() {

  delete toggle.combo;

  removeIcon("heavyswing");
  removeIcon("maim");
  removeIcon("stormspath");

  // Revisit this later if it is refreshing too much
  if (player.level >= 50
  && checkRecast("berserk") < 17500
  && checkStatus("stormseye", player.ID) - Math.max(checkRecast("berserk"), 0) < 20000) {
    stormseyeCombo();
  }

  else if (player.level >= 74
  && enemyTargets >= 2
  && checkStatus("stormseye", player.ID) > 7500) {
    mythriltempestCombo();
  }

  else if (player.level >= 50
  && enemyTargets >= 3
  && checkStatus("stormseye", player.ID) > 7500) {
    mythriltempestCombo();
  }

  // Revisit this later if it is too conservative
  else if (player.level >= 50
  && checkStatus("stormseye", player.ID) < 10000) {
    stormseyeCombo();
  }

  else if (player.level >= 40
  && enemyTargets >= 3) {
    mythriltempestCombo();
  }

  else {
    stormspathCombo();
  }
}

function warComboTimeout() {
  clearTimeout(timeout.combo);
  timeout.combo = setTimeout(warCombo, 12500);
}

function stormspathCombo() {
  next.combo = 1;
  addIcon("heavyswing");
  if (player.level >= 18) {
    addIcon("maim");
  }
  if (player.level >= 38) {
    addIcon("stormspath");
  }
}

function stormseyeCombo() {
  next.combo = 2;
  addIcon("heavyswing");
  addIcon("maim");
  addIcon("stormseye");
}

function mythriltempestCombo() {
  next.combo = 3;
  addIcon("overpower");
  removeIcon("maim");
  if (player.level >= 40) {
    addIcon("mythriltempest");
  }
}
