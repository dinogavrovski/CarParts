// Maps brand names (as stored in DB) to logo URLs from a public CDN
const BASE = 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb'

const LOGO_MAP = {
  'ALFA ROMEO':    `${BASE}/alfa-romeo.png`,
  'AUDI':          `${BASE}/audi.png`,
  'BMW':           `${BASE}/bmw.png`,
  'BYD':           `${BASE}/byd.png`,
  'CHEVROLET':     `${BASE}/chevrolet.png`,
  'CHRYSLER':      `${BASE}/chrysler.png`,
  'CITROEN':       `${BASE}/citroen.png`,
  'CUPRA':         `${BASE}/cupra.png`,
  'DACIA':         `${BASE}/dacia.png`,
  'DAEWOO':        `${BASE}/daewoo.png`,
  'DAIHATSU':      `${BASE}/daihatsu.png`,
  'DODGE':         `${BASE}/dodge.png`,
  'DS':            `${BASE}/ds.png`,
  'FIAT':          `${BASE}/fiat.png`,
  'FORD':          `${BASE}/ford.png`,
  'HONDA':         `${BASE}/honda.png`,
  'HYUNDAI':       `${BASE}/hyundai.png`,
  'INFINITI':      `${BASE}/infiniti.png`,
  'ISUZU':         `${BASE}/isuzu.png`,
  'IVECO':         `${BASE}/iveco.png`,
  'JAGUAR':        `${BASE}/jaguar.png`,
  'JEEP':          `${BASE}/jeep.png`,
  'KIA':           `${BASE}/kia.png`,
  'LADA':          `${BASE}/lada.png`,
  'LANCIA':        `${BASE}/lancia.png`,
  'LAND ROVER':    `${BASE}/land-rover.png`,
  'LEXUS':         `${BASE}/lexus.png`,
  'LOTUS':         `${BASE}/lotus.png`,
  'MASERATI':      `${BASE}/maserati.png`,
  'MAZDA':         `${BASE}/mazda.png`,
  'MERCEDES':      `${BASE}/mercedes-benz.png`,
  'MG':            `${BASE}/mg.png`,
  'MINI':          `${BASE}/mini.png`,
  'MITSUBISHI':    `${BASE}/mitsubishi.png`,
  'NISSAN':        `${BASE}/nissan.png`,
  'OPEL':          `${BASE}/opel.png`,
  'PEUGEOT':       `${BASE}/peugeot.png`,
  'PORSCHE':       `${BASE}/porsche.png`,
  'RENAULT':       `${BASE}/renault.png`,
  'ROVER':         `${BASE}/rover.png`,
  'SAAB':          `${BASE}/saab.png`,
  'SEAT':          `${BASE}/seat.png`,
  'SKODA':         `${BASE}/skoda.png`,
  'SMART':         `${BASE}/smart.png`,
  'SSANGYONG':     `${BASE}/ssangyong.png`,
  'SUBARU':        `${BASE}/subaru.png`,
  'SUZUKI':        `${BASE}/suzuki.png`,
  'TESLA':         `${BASE}/tesla.png`,
  'TOYOTA':        `${BASE}/toyota.png`,
  'VOLKSWAGEN':    `${BASE}/volkswagen.png`,
  'VOLVO':         `${BASE}/volvo.png`,
}

export function getLogoUrl(brand) {
  return LOGO_MAP[brand.toUpperCase()] || null
}

// Clean model name: extract base name + year range from Macedonian text
// e.g. brand="FORD" model="FOCUS - DELOVI ZA FORD FOCUS 98 04 AVTO DELOVI ZA KAROSERIJA"
//      → "FOCUS 98-04"
export function cleanModelName(brand, model) {
  let name = model
  let yearSuffix = ''

  const deloviIdx = name.indexOf(' - DELOVI ZA')
  if (deloviIdx !== -1) {
    const macedonian = name.slice(deloviIdx)

    // Two-year range: "98 04 AVTO" → "98-04"
    const twoYear = macedonian.match(/\b(\d{2})\s+(\d{2})\s+(AVTO|avto)/)
    // Open-ended: "22  AVTO" (two+ spaces before AVTO) → "22-"
    const oneYear = macedonian.match(/\b(\d{2})\s{2,}(AVTO|avto)/)

    if (twoYear) {
      yearSuffix = ` ${twoYear[1]}-${twoYear[2]}`
    } else if (oneYear) {
      yearSuffix = ` ${oneYear[1]}-`
    }

    name = name.slice(0, deloviIdx).trim()
  }

  // Strip duplicate brand prefix e.g. brand="DS" model="DS DS7" → "DS7"
  const prefix = brand.toUpperCase() + ' '
  if (name.toUpperCase().startsWith(prefix)) {
    name = name.slice(prefix.length).trim()
  }

  return name + yearSuffix
}

// Split a cleaned model name into { base, year }
// Handles: "FOCUS 98-04", "FOCUS 04 08", "FOCUS 08-", "FOCUS 08"
export function splitModelYear(brand, rawModel) {
  const cleaned = cleanModelName(brand, rawModel)

  // Format 1: "FOCUS 98-04" or "FOCUS 08-"
  const dashMatch = cleaned.match(/^(.+?)\s+(\d{2}-\d{2}|\d{2}-)$/)
  if (dashMatch) return { base: dashMatch[1], year: dashMatch[2], full: rawModel }

  // Format 2: "FOCUS 04 08" (two space-separated 2-digit years at the end)
  const spaceMatch = cleaned.match(/^(.+?)\s+(\d{2})\s+(\d{2})$/)
  if (spaceMatch) return { base: spaceMatch[1], year: `${spaceMatch[2]}-${spaceMatch[3]}`, full: rawModel }

  // Format 3: "FOCUS 08" (single trailing year = open-ended)
  const singleMatch = cleaned.match(/^(.+?)\s+(\d{2})$/)
  if (singleMatch) return { base: singleMatch[1], year: `${singleMatch[2]}-`, full: rawModel }

  return { base: cleaned, year: null, full: rawModel }
}
