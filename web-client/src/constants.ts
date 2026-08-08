// NZ Territorial Authority names used to filter housing charts down to a readable
// set of major cities instead of showing every district/region in the country.
// Must always be paired with `areaType === 'TA'` when filtering — the housing
// datasets report the same area name at more than one geography level (e.g.
// "Auckland" exists as both a TA and an EUA/Region row with different values),
// so area name alone isn't a unique key and picks up duplicate/extra bars.
export const majorCities = ["Auckland", "Wellington City", "Christchurch City", "Hamilton City", "Dunedin City", "Tauranga City"]
