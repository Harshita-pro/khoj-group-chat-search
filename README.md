# khoj. / group chat search

A small synthetic group-chat search experiment for meaning-first retrieval in messy Hinglish.

## Run it

```text
npm install
npm start
```

Open http://localhost:4173.

Run the labeled benchmark with:

```text
npm test
```

Regenerate the 4,000-message corpus artifact with `npm run generate`.

## What is included

- 4,000 synthetic messages across six months
- 8 participants, Hinglish, typos, short replies, forwarded text, and omitted media-style filler
- Three decision threads: the Manali trip, the per-person budget, and the Studio 14 venue
- 40 labeled queries, including 8 zero-word-overlap queries
- Context-rich result cards that surface the decision message and its nearby thread
- Query-shape signals for meaning, person, and time
- Node backend API at `/api/search?q=...`; the browser sends live searches to the server

## Current result

The local benchmark currently reports:

- 36/40 overall: 90%
- 8/8 zero-overlap: 100%

The ranker is intentionally small and inspectable. It uses an intent vocabulary, person and date signals, decision-message weighting, and thread context rather than a hosted embedding API. The Node server owns the corpus and serves ranked results through `/api/search`, while the browser only renders the response. That makes the demo reproducible and makes its limits easy to study before swapping in multilingual embeddings.

## Demo run

Try these live queries:

1. `When did we decide on the trip?` -> `m-0401`, Priya, Manali decision
2. `When was the hill station chosen?` -> `m-0401`, zero word overlap with the answer text
3. `What did Priya say about the budget?` -> the budget thread and final amount

This corpus is synthetic by design. No real chat export is included.
