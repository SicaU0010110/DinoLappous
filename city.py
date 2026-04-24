import random
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class Building:
    x: int
    y: int
    width: int
    height: int
    type: str
    floors: int
    capacity: int

@dataclass
class City:
    name: str
    width: int
    height: int
    buildings: List[Building]
    roads: List[Tuple[int, int]]
    population: int
    features: Dict[str, List[Tuple[int, int]]]
    description: str

class CityGenerator:
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        self.grid = [[0 for _ in range(width)] for _ in range(height)]
        self.buildings = []
        self.roads = []
        self.features = {
            'parks': [],
            'landmarks': [],
            'services': []
        }
        self.architectural_styles = [
            "Neo-Gothic Brutalism: Heavy stone mixed with sharp glass and vertical spires.",
            "Solar-Punk Organic: Buildings integrated with giant flora and translucent panels.",
            "Clockwork Victorian: Exposed brass pipes, steam-vents, and rotating gear-facades.",
            "Aeon-Tech Minimal: Floating structures with pulsing neon conduits and matte white plating."
        ]
    
    def generate_city(self, name: str = "Unnamed Settlement") -> City:
        # Create Districts
        self._create_districts()
        # Generate Roads
        self._generate_roads()
        # Place Buildings
        self._place_buildings()
        # Add Features
        self._add_features()
        # Calculate Population
        population = self._calculate_population()
        
        style = random.choice(self.architectural_styles)
        description = f"Architectural Style: {style}\n\n"
        description += f"District Atmospheres:\n"
        description += f"- Residential: Quiet, lantern-lit streets with layered garden balconies.\n"
        description += f"- Commercial: High-energy plazas featuring holographic trade-banners and crowded sky-walks.\n"
        description += f"- Industrial: Low-humming machinery, heavy iron gates, and the constant hiss of cooling vents.\n\n"
        description += f"The settlement of {name} stands as a testament to its builders, with {len(self.buildings)} structures organized across a precise grid, catering to a thriving population of {population} souls."

        return City(
            name=name,
            width=self.width,
            height=self.height,
            buildings=self.buildings,
            roads=[(r[0], r[1]) for r in self.roads],
            population=population,
            features=self.features,
            description=description
        )
    
    def _create_districts(self):
        district_types = ['residential', 'commercial', 'industrial']
        num_districts_x = 4
        num_districts_y = 4
        dx = self.width // num_districts_x
        dy = self.height // num_districts_y
        
        for i in range(num_districts_x):
            for j in range(num_districts_y):
                dtype = random.choice(district_types)
                for x in range(i * dx, min((i + 1) * dx, self.width)):
                    for y in range(j * dy, min((j + 1) * dy, self.height)):
                        self.grid[y][x] = dtype

    def _generate_roads(self):
        # Major roads every 10 units
        for x in range(0, self.width, 10):
            for y in range(self.height):
                self.roads.append((x, y))
        for y in range(0, self.height, 10):
            for x in range(self.width):
                self.roads.append((x, y))

    def _place_buildings(self):
        block_size = 5
        for x in range(2, self.width - block_size, block_size + 1):
            for y in range(2, self.height - block_size, block_size + 1):
                # Skip if there's a road
                if any((x+i, y+j) in self.roads for i in range(block_size) for j in range(block_size)):
                    continue
                
                if random.random() < 0.7:
                    b_type = self.grid[y][x] if isinstance(self.grid[y][x], str) else 'residential'
                    floors = random.randint(1, 3)
                    if b_type == 'commercial': floors = random.randint(2, 6)
                    elif b_type == 'industrial': floors = random.randint(1, 2)
                    
                    self.buildings.append(Building(
                        x=x, y=y, width=block_size-1, height=block_size-1,
                        type=b_type, floors=floors, capacity=floors * random.randint(5, 20)
                    ))

    def _add_features(self):
        for _ in range(5):
            self.features['parks'].append((random.randint(0, self.width-1), random.randint(0, self.height-1)))
        for _ in range(2):
            self.features['landmarks'].append((random.randint(0, self.width-1), random.randint(0, self.height-1)))

    def _calculate_population(self) -> int:
        return sum(b.capacity for b in self.buildings)
