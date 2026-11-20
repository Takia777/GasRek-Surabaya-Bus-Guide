# Ontology

Owner: Nashwa. Task sheet: [`docs/tasks/nashwa.md`](../docs/tasks/nashwa.md).

The ontology defines the vocabulary of GasRek!: operators, routes, stops, stop groups, areas, passenger types and fares. It is the schema of the data, and its reasoner infers facts that the rest of the system uses, most importantly which stops are **transfer stops**.

## Planned files

| File | Content |
| --- | --- |
| `gasrek.owl` | The ontology, built in Protégé |
| `populate.py` | Script that adds individuals from `data/processed/` (Owlready2) |
| `export_inferred.py` | Script that runs the reasoner and exports inferred facts |
| `inferred/transfer_stops.csv` | Stops inferred as `TransferStop` |
| `inferred/stop_groups.csv` | Stops that belong to the same location |
| `images/` | Class hierarchy and reasoner screenshots for the report |

## Main classes

`Operator`, `Route`, `Stop`, `StopGroup`, `TransferStop` (inferred), `Area`, `PassengerType`, `Fare`.

## Key inference

`TransferStop` ≡ `Stop` and `isServedBy min 2 Route`. All route individuals must be declared different from each other, otherwise the reasoner cannot count two distinct routes.
