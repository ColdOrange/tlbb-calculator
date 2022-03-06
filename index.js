const ratios = {
  MJ: {
    b: 1,
    h: 1.5,
    x: 1,
    d: 1,
    w: 0.058,
    n: 0.015
  },
  SL: {
    b: 1,
    h: 1,
    x: 1.5,
    d: 1,
    w: 0.058,
    n: 0.015
  },
  GB: {
    b: 1,
    h: 1.25,
    x: 1,
    d: 1.3,
    w: 0.058,
    n: 0.015
  },
  TS: {
    b: 1.5,
    h: 1,
    x: 1,
    d: 1,
    w: 0.058,
    n: 0.015
  },
  WD: {
    b: 1.25,
    h: 1.2,
    x: 1.1,
    d: 1,
    w: 0.004,
    n: 0.071
  },
  EM: {
    b: 1.2,
    h: 1,
    x: 1.25,
    d: 1,
    w: 0.004,
    n: 0.071
  },
  XY: {
    b: 1,
    h: 1.3,
    x: 1,
    d: 1.25,
    w: 0.004,
    n: 0.071
  },
  XX: {
    b: 1,
    h: 1,
    x: 1,
    d: 1.5,
    w: 0.004,
    n: 0.071
  },
  TL: {
    b: 1.15,
    h: 1.15,
    x: 1.15,
    d: 1.15,
    w: 0.044,
    n: 0.044
  }
}

function getAttrs() {
  const attrsForm = document.querySelector('#attributes > form')
  return Array.from(attrsForm.elements).reduce((map, input) => {
    const attr = input.id[0]
    const subAttr = input.id.slice(2)
    if (map[attr] === undefined) {
      map[attr] = {}
    }
    map[attr][subAttr] = parseInt(input.value || '0')
    return map
  }, {})
}

function getEnemy() {
  const enemyForm = document.querySelector('#enemy > form')
  return Array.from(enemyForm.elements).reduce((map, input) => {
    if (input.id === 'enemy-type') {
      map[input.id] = input.value
    } else {
      map[input.id] = parseInt(input.value || '0')
    }
    return map
  }, {})
}

function isSX(attr) {
  return ['b', 'h', 'x', 'd'].includes(attr)
}

// 属性攻击
function calcSX(attack, ratio, defense, ignoreDefense, ignoreDefenseLimit) {
  if (defense > ignoreDefense) {  // 未减完抗性
    const defenseLeft = defense - ignoreDefense
    return attack * ratio * (100 - Math.min(defenseLeft, 100)) / 100
  } else {  // 减完抗性，下限生效
    return attack * ratio * (100 + ignoreDefenseLimit) / 100
  }
}

// 内外功攻击
function calcNW(attack, ratio, defense) {
  if (attack + defense === 0) {
    return 0
  }
  return attack * ratio * (attack / (attack + defense))
}

function show(damages) {
  const totalDamage = Object.values(damages).reduce((total, damage) => total + damage, 0)
  damages['total'] = damages['show'] = totalDamage
  damages['total-critical'] = damages['show-critical'] = totalDamage * 2

  for (const [attr, damage] of Object.entries(damages)) {
    document.getElementById(`${attr}-damage`).innerText =
      attr.startsWith('show') ? `-${Math.round(damage)}` : `${Math.round(damage)}`
  }
}

function calc() {
  const job = document.getElementById('job-select').value
  const attrs = getAttrs()
  const enemy = getEnemy()

  const damages = {}
  for (const [attr, ratio] of Object.entries(ratios[job])) {
    const attack = attrs[attr]['attack']
    const ignoreDefense = attrs[attr]['ignore-defense']
    const ignoreDefenseLimit = attrs[attr]['ignore-defense-limit']
    const enemyDefense = enemy[`${attr}-defense`]
    const enemyType = enemy['enemy-type']

    const damage = isSX(attr) ?
      calcSX(attack, ratio, enemyDefense, ignoreDefense, ignoreDefenseLimit) :
      calcNW(attack, ratio, enemyDefense)

    if (enemyType === 'monster') {
      damages[attr] = damage * 5
    } else {  // enemyType === 'person'
      damages[attr] = damage
    }
  }

  show(damages)
}

submit = document.getElementById('submit')
submit.addEventListener('click', calc)
