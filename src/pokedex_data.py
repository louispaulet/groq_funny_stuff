POKEDEX = {
    "bulbasaur": {
        "name": "Bulbasaur",
        "dex": 1,
        "types": ["Grass", "Poison"],
        "abilities": ["Overgrow", "Chlorophyll (Hidden)"],
        "height_m": 0.7,
        "weight_kg": 6.9,
        "evolution": "Bulbasaur → Ivysaur → Venusaur",
        "weaknesses": ["Fire", "Flying", "Ice", "Psychic"],
        "strengths": ["Water", "Ground", "Rock"],
        "description": "A Seed Pokémon that nurtures a plant bulb on its back. It stores energy from sunlight, aiding its growth and power."
    },
    "charmander": {
        "name": "Charmander",
        "dex": 4,
        "types": ["Fire"],
        "abilities": ["Blaze", "Solar Power (Hidden)"],
        "height_m": 0.6,
        "weight_kg": 8.5,
        "evolution": "Charmander → Charmeleon → Charizard",
        "weaknesses": ["Water", "Ground", "Rock"],
        "strengths": ["Grass", "Bug", "Ice", "Steel"],
        "description": "A Fire-type lizard Pokémon whose tail flame reflects its health and emotions. It becomes fiercer as the flame burns brighter."
    },
    "charizard": {
        "name": "Charizard",
        "dex": 6,
        "types": ["Fire", "Flying"],
        "abilities": ["Blaze", "Solar Power (Hidden)"],
        "height_m": 1.7,
        "weight_kg": 90.5,
        "evolution": "Charmander → Charmeleon → Charizard",
        "weaknesses": ["Water", "Electric", "Rock (4×)"],
        "strengths": ["Grass", "Bug", "Ice", "Fighting"],
        "description": "Charizard soars in search of powerful opponents, breathing intense flames that can melt boulders. Its fiery breath grows hotter with experience."
    },
    "squirtle": {
        "name": "Squirtle",
        "dex": 7,
        "types": ["Water"],
        "abilities": ["Torrent", "Rain Dish (Hidden)"],
        "height_m": 0.5,
        "weight_kg": 9.0,
        "evolution": "Squirtle → Wartortle → Blastoise",
        "weaknesses": ["Electric", "Grass"],
        "strengths": ["Fire", "Ground", "Rock"],
        "description": "A Tiny Turtle Pokémon that withdraws into its shell for protection and to shoot water with great accuracy."
    },
    "pikachu": {
        "name": "Pikachu",
        "dex": 25,
        "types": ["Electric"],
        "abilities": ["Static", "Lightning Rod (Hidden)"],
        "height_m": 0.4,
        "weight_kg": 6.0,
        "evolution": "Pichu → Pikachu → Raichu",
        "weaknesses": ["Ground"],
        "strengths": ["Flying", "Water"],
        "description": "An Electric Mouse Pokémon that stores electricity in its cheeks. It communicates and defends itself by releasing electric discharges."
    },
    "raichu": {
        "name": "Raichu",
        "dex": 26,
        "types": ["Electric"],
        "abilities": ["Static", "Lightning Rod (Hidden)"],
        "height_m": 0.8,
        "weight_kg": 30.0,
        "evolution": "Pichu → Pikachu → Raichu",
        "weaknesses": ["Ground"],
        "strengths": ["Flying", "Water"],
        "description": "Raichu’s tail acts as a ground for excess electricity. It is faster and more powerful than Pikachu, discharging intense currents in battle."
    },
    "eevee": {
        "name": "Eevee",
        "dex": 133,
        "types": ["Normal"],
        "abilities": ["Run Away", "Adaptability", "Anticipation (Hidden)"],
        "height_m": 0.3,
        "weight_kg": 6.5,
        "evolution": "Eevee → Vaporeon/Jolteon/Flareon/Espeon/Umbreon/Leafeon/Glaceon/Sylveon",
        "weaknesses": ["Fighting"],
        "strengths": [],
        "description": "A Pokémon with unstable genetic makeup that can evolve into many forms. Its adaptability makes it popular among Trainers."
    },
    "snorlax": {
        "name": "Snorlax",
        "dex": 143,
        "types": ["Normal"],
        "abilities": ["Immunity", "Thick Fat", "Gluttony (Hidden)"],
        "height_m": 2.1,
        "weight_kg": 460.0,
        "evolution": "Munchlax → Snorlax",
        "weaknesses": ["Fighting"],
        "strengths": [],
        "description": "It eats nearly 900 pounds of food every day and sleeps the rest of the time. Despite its laziness, it can be a formidable wall in battle."
    },
    "gengar": {
        "name": "Gengar",
        "dex": 94,
        "types": ["Ghost", "Poison"],
        "abilities": ["Cursed Body"],
        "height_m": 1.5,
        "weight_kg": 40.5,
        "evolution": "Gastly → Haunter → Gengar",
        "weaknesses": ["Ghost", "Psychic", "Dark"],
        "strengths": ["Psychic", "Ghost", "Grass", "Fairy"],
        "description": "On the darkest nights, Gengar’s shadow moves on its own, playing tricks on people. It is mischievous and loves scaring with eerie smiles."
    },
    "jigglypuff": {
        "name": "Jigglypuff",
        "dex": 39,
        "types": ["Normal", "Fairy"],
        "abilities": ["Cute Charm", "Competitive", "Friend Guard (Hidden)"],
        "height_m": 0.5,
        "weight_kg": 5.5,
        "evolution": "Igglybuff → Jigglypuff → Wigglytuff",
        "weaknesses": ["Steel", "Poison"],
        "strengths": ["Fighting", "Dragon (immune)"],
        "description": "It captivates foes with its huge, round eyes and lulls them to sleep with a soothing lullaby. Its voice can vary in pitch at will."
    },
    "mewtwo": {
        "name": "Mewtwo",
        "dex": 150,
        "types": ["Psychic"],
        "abilities": ["Pressure", "Unnerve (Hidden)"],
        "height_m": 2.0,
        "weight_kg": 122.0,
        "evolution": "None",
        "weaknesses": ["Bug", "Ghost", "Dark"],
        "strengths": ["Fighting", "Poison"],
        "description": "A Pokémon created by genetic manipulation, it possesses incredible psychic powers. Its battle prowess and intellect are unmatched."
    }
}

AVAILABLE_NAMES = sorted([data["name"] for data in POKEDEX.values()])

