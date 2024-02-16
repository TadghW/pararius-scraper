const targets = [
    {name: 'beverwijk', population: 41863},
    {name: 'rotterdam', population: 1273385},
    {name: 'amsterdam', population: 1459402},
    {name: 'den-haag', population: 883720},
    {name: 'utrecht', population: 656342},
    {name: 'breda', population: 553706},
    {name: 'haarlem', population: 420337},
    {name: 'arnhem', population: 361048},
    {name: 'leiden', population: 344299},
    {name: 'amersfoort', population: 287110},
    {name: 'almere', population: 214715},
    {name: 'zoetermeer', population: 125267},
    {name: 'alphen-aan-den-rijn', population: 112587},
    {name: 'delft', population: 103581},
    {name: 'amstelveen', population: 90829},
    {name: 'hilversum', population: 90261},
    {name: 'hoofddorp', population: 77885},
    {name: 'zaandam', population: 76804},
    {name: 'gouda', population: 73681},
    {name: 'capelle-aan-den-ijssel', population: 67319},
    {name: 'katwijk', population: 65929},
    {name: 'nieuwegein', population: 63886},
    {name: 'rijswijk', population: 55220},
    {name: 'woerden', population: 52694},
    {name: 'zeist', population: 51385},
    {name: 'soest', population: 49606},
    {name: 'voorburg', population: 39000},
    {name: 'nieuw-vennep', population: 31415},
    {name: 'baarn', population: 24792},
    {name: 'lisse', population: 22982},
    {name: 'hillegom', population: 22197},
    {name: 'lunteren', population: 13775},
    {name: 'abcoude', population: 8657},
    {name: 'berkel-en-rodenrijs', population: 8657},
    {name: 'zaandijk', population: 8600},
    {name: 'achterveld-ut', population: 2625},
]

const radius = 5

const sqm = 90

const bed = 2

const lowerLimit = 1200

const upperLimit = 2400

const minListings = 1

const minPopulation = 10000

const maxCommute = 30

export default {
    targets,
    radius,
    sqm,
    bed,
    lowerLimit,
    upperLimit,
    minListings,
    minPopulation,
    maxCommute
}