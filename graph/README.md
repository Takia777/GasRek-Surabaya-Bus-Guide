# Graph

Owner: Naura. Task sheet: [`docs/tasks/naura.md`](../docs/tasks/naura.md).

Neo4j holds the bus network: stops as nodes, consecutive stops on a route as `NEXT` relationships, and walking links between stops of one group as `TRANSFER` relationships. It finds candidate paths, distances and the nearest stops.

## Planned files

| Folder / file | Content |
| --- | --- |
| `import/` | Scripts that load `data/processed/` and `ontology/inferred/` into Neo4j, from an empty database |
| `queries/candidate_paths.cypher` | Paths from origin to destination with up to 2 transfers |
| `queries/nearest_stops.cypher` | Nearest stops with a route, by coordinates |
| `queries/search_stops.cypher` | Stop name search using names and aliases |

## Model

| Element | Properties |
| --- | --- |
| `(:Stop)` | `stop_id`, `name`, `location`, `group_id` |
| `(:Route)` | `route_id`, `operator`, `name`, `first_departure`, `last_departure`, `headway_min` |
| `(:Operator)` | `name` |
| `[:NEXT]` | `route_id`, `direction`, `seq`, `distance_km`, `travel_min` |
| `[:SERVES]` | `direction`, `seq` |
| `[:TRANSFER]` | `walk_min` |
| `[:OPERATED_BY]` | — |

## Assumptions

Travel time between stops is estimated; the method is written here once chosen.
