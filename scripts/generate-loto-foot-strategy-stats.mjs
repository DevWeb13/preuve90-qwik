import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const PUBLICATIONS_DIR = path.join(ROOT_DIR, "src/content/loto-foot/publications");
const RESULTS_DIR = path.join(ROOT_DIR, "src/content/loto-foot/results");
const OUTPUT_FILE = path.join(ROOT_DIR, "docs/automations/loto-foot-strategy-stats.json");
const SELECTIONS = ["1", "N", "2"];

const round = (value, digits = 1) => Number(value.toFixed(digits));
const percentage = (part, total, digits = 1) => (total > 0 ? round((part / total) * 100, digits) : 0);
const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function readJsonDirectory(directory) {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  return Promise.all(
    names.map(async (name) => {
      const content = await readFile(path.join(directory, name), "utf8");
      return JSON.parse(content);
    }),
  );
}

function orderedOfficialSelections(result) {
  return [...result.matches]
    .sort((left, right) => left.position - right.position)
    .map((match) => match.selection);
}

function countCorrect(ticket, officialSelections) {
  if (!Array.isArray(ticket.selections) || ticket.selections.length !== officialSelections.length) {
    throw new Error(`Combinaison invalide dans ${ticket.id ?? "ticket sans id"}.`);
  }
  return ticket.selections.reduce(
    (total, selection, index) =>
      total + Number(officialSelections[index] === "G" || selection === officialSelections[index]),
    0,
  );
}

function payoutFor(result, correctSelections) {
  return result.payouts.find((payout) => payout.correctSelections === correctSelections)?.amountCents ?? 0;
}

function pairwiseDistanceStats(tickets, matchCount) {
  if (tickets.length < 2 || matchCount === 0) {
    return { averagePositions: 0, averagePct: 0, minimumPositions: 0, maximumPositions: 0 };
  }
  const distances = [];
  for (let left = 0; left < tickets.length; left += 1) {
    for (let right = left + 1; right < tickets.length; right += 1) {
      let distance = 0;
      for (let index = 0; index < matchCount; index += 1) {
        distance += Number(tickets[left].selections[index] !== tickets[right].selections[index]);
      }
      distances.push(distance);
    }
  }
  return {
    averagePositions: round(mean(distances), 2),
    averagePct: round((mean(distances) / matchCount) * 100, 1),
    minimumPositions: Math.min(...distances),
    maximumPositions: Math.max(...distances),
  };
}

function buildRecord(publication, result) {
  if (!Array.isArray(publication.tickets) || publication.tickets.length === 0) {
    throw new Error(`Publication sans combinaison : ${publication.id}.`);
  }
  if (!Array.isArray(publication.matches) || publication.matches.length !== result.matches.length) {
    throw new Error(`Nombre de matchs incohérent pour ${publication.id}.`);
  }

  const officialSelections = orderedOfficialSelections(result);
  const ticketSettlements = publication.tickets.map((ticket) => {
    const correctSelections = countCorrect(ticket, officialSelections);
    return {
      correctSelections,
      payoutCents: payoutFor(result, correctSelections),
    };
  });
  const stakeCents = publication.tickets.length * 100;
  const returnCents = ticketSettlements.reduce((sum, ticket) => sum + ticket.payoutCents, 0);
  const baseCorrect = ticketSettlements[0].correctSelections;
  const bestCorrect = Math.max(...ticketSettlements.map((ticket) => ticket.correctSelections));

  let coveredOfficialPositions = 0;
  officialSelections.forEach((officialSelection, index) => {
    if (
      officialSelection === "G" ||
      publication.tickets.some((ticket) => ticket.selections[index] === officialSelection)
    ) {
      coveredOfficialPositions += 1;
    }
  });

  return {
    publication,
    result,
    officialSelections,
    ticketSettlements,
    stakeCents,
    returnCents,
    netCents: returnCents - stakeCents,
    baseCorrect,
    bestCorrect,
    coveredOfficialPositions,
    diversity: pairwiseDistanceStats(publication.tickets, publication.matches.length),
  };
}

function summarize(records) {
  const settledPublications = records.length;
  const settledTickets = records.reduce((sum, record) => sum + record.publication.tickets.length, 0);
  const stakeCents = records.reduce((sum, record) => sum + record.stakeCents, 0);
  const returnCents = records.reduce((sum, record) => sum + record.returnCents, 0);
  const totalMatches = records.reduce((sum, record) => sum + record.publication.matches.length, 0);
  const bestCorrect = records.reduce((sum, record) => sum + record.bestCorrect, 0);
  const baseCorrect = records.reduce((sum, record) => sum + record.baseCorrect, 0);
  const coveredOfficialPositions = records.reduce(
    (sum, record) => sum + record.coveredOfficialPositions,
    0,
  );
  const multiTicketRecords = records.filter((record) => record.publication.tickets.length > 1);
  const winningTickets = records.reduce(
    (sum, record) => sum + record.ticketSettlements.filter((ticket) => ticket.payoutCents > 0).length,
    0,
  );

  return {
    settledPublications,
    settledTickets,
    averageTicketsPerPublication: round(settledTickets / Math.max(settledPublications, 1), 2),
    stakeCents,
    returnCents,
    netCents: returnCents - stakeCents,
    yieldPct: percentage(returnCents - stakeCents, stakeCents),
    returningPublications: records.filter((record) => record.returnCents > 0).length,
    profitablePublications: records.filter((record) => record.netCents > 0).length,
    winningTickets,
    winningTicketRatePct: percentage(winningTickets, settledTickets),
    bestTicketAccuracyPct: percentage(bestCorrect, totalMatches),
    firstTicketAccuracyPct: percentage(baseCorrect, totalMatches),
    portfolioOutcomeCoveragePct: percentage(coveredOfficialPositions, totalMatches),
    additionalTicketsImprovedBestScorePublications: multiTicketRecords.filter(
      (record) => record.bestCorrect > record.baseCorrect,
    ).length,
    additionalTicketsImprovedBestScoreRatePct: percentage(
      multiTicketRecords.filter((record) => record.bestCorrect > record.baseCorrect).length,
      multiTicketRecords.length,
    ),
    averageBestScoreGainFromAdditionalTickets: round(
      mean(multiTicketRecords.map((record) => record.bestCorrect - record.baseCorrect)),
      2,
    ),
    averagePairwiseTicketDistancePct: round(
      mean(multiTicketRecords.map((record) => record.diversity.averagePct)),
      1,
    ),
  };
}

function buildSelectionStats(records) {
  const official = Object.fromEntries(SELECTIONS.map((selection) => [selection, 0]));
  const tickets = Object.fromEntries(SELECTIONS.map((selection) => [selection, 0]));
  let officialTotal = 0;
  let ticketTotal = 0;

  for (const record of records) {
    for (const selection of record.officialSelections) {
      if (SELECTIONS.includes(selection)) {
        official[selection] += 1;
        officialTotal += 1;
      }
    }
    for (const ticket of record.publication.tickets) {
      for (const selection of ticket.selections) {
        if (SELECTIONS.includes(selection)) {
          tickets[selection] += 1;
          ticketTotal += 1;
        }
      }
    }
  }

  const format = (counts, total) =>
    Object.fromEntries(
      SELECTIONS.map((selection) => [
        selection,
        { count: counts[selection], pct: percentage(counts[selection], total) },
      ]),
    );

  return {
    officialResults: { total: officialTotal, ...format(official, officialTotal) },
    publishedTicketSelections: { total: ticketTotal, ...format(tickets, ticketTotal) },
    coverageGapPct: Object.fromEntries(
      SELECTIONS.map((selection) => [
        selection,
        round(percentage(tickets[selection], ticketTotal) - percentage(official[selection], officialTotal), 1),
      ]),
    ),
  };
}

function probabilityForSelection(match, selection) {
  if (selection === "1") return match.probabilities.home;
  if (selection === "N") return match.probabilities.draw;
  return match.probabilities.away;
}

function topPrediction(match) {
  return SELECTIONS.map((selection) => ({
    selection,
    probability: probabilityForSelection(match, selection),
  })).sort((left, right) => right.probability - left.probability)[0];
}

function calibrationBucket(probability) {
  if (probability < 40) return "0-39";
  if (probability < 50) return "40-49";
  if (probability < 60) return "50-59";
  if (probability < 70) return "60-69";
  if (probability < 80) return "70-79";
  return "80-100";
}

function buildCalibration(records) {
  const buckets = new Map();
  const bySelection = new Map(SELECTIONS.map((selection) => [selection, { count: 0, hits: 0 }]));
  let observations = 0;
  let hits = 0;
  let probabilitySum = 0;
  let brierSum = 0;

  for (const record of records) {
    const officialByPosition = new Map(resultPositions(record.result).map((item) => [item.position, item.selection]));
    for (const match of publicationPositions(record.publication)) {
      const officialSelection = officialByPosition.get(match.position);
      if (!SELECTIONS.includes(officialSelection)) continue;

      const top = topPrediction(match);
      const hit = Number(top.selection === officialSelection);
      const bucketName = calibrationBucket(top.probability);
      const bucket = buckets.get(bucketName) ?? { count: 0, hits: 0, probabilitySum: 0 };
      bucket.count += 1;
      bucket.hits += hit;
      bucket.probabilitySum += top.probability;
      buckets.set(bucketName, bucket);

      const selectionStats = bySelection.get(top.selection);
      selectionStats.count += 1;
      selectionStats.hits += hit;

      const outcomes = { "1": 0, N: 0, "2": 0 };
      outcomes[officialSelection] = 1;
      brierSum += SELECTIONS.reduce((sum, selection) => {
        const predicted = probabilityForSelection(match, selection) / 100;
        return sum + (predicted - outcomes[selection]) ** 2;
      }, 0);

      observations += 1;
      hits += hit;
      probabilitySum += top.probability;
    }
  }

  const bucketOrder = ["0-39", "40-49", "50-59", "60-69", "70-79", "80-100"];
  return {
    observations,
    topPredictionAccuracyPct: percentage(hits, observations),
    averageTopPredictedProbabilityPct: round(probabilitySum / Math.max(observations, 1), 1),
    calibrationGapPct: round(
      percentage(hits, observations) - probabilitySum / Math.max(observations, 1),
      1,
    ),
    brierScore: round(brierSum / Math.max(observations, 1), 4),
    byTopSelection: Object.fromEntries(
      SELECTIONS.map((selection) => {
        const stats = bySelection.get(selection);
        return [selection, { count: stats.count, accuracyPct: percentage(stats.hits, stats.count) }];
      }),
    ),
    byProbabilityBucket: Object.fromEntries(
      bucketOrder.map((name) => {
        const stats = buckets.get(name) ?? { count: 0, hits: 0, probabilitySum: 0 };
        const expected = stats.probabilitySum / Math.max(stats.count, 1);
        const actual = percentage(stats.hits, stats.count);
        return [
          name,
          {
            count: stats.count,
            averagePredictedProbabilityPct: round(expected, 1),
            actualHitRatePct: actual,
            calibrationGapPct: round(actual - expected, 1),
          },
        ];
      }),
    ),
  };
}

function publicationPositions(publication) {
  return [...publication.matches].sort((left, right) => left.position - right.position);
}

function resultPositions(result) {
  return [...result.matches].sort((left, right) => left.position - right.position);
}

function ticketBand(ticketCount) {
  if (ticketCount <= 3) return "1-3";
  if (ticketCount <= 6) return "4-6";
  if (ticketCount <= 10) return "7-10";
  return "11+";
}

function buildTicketBands(records) {
  const order = ["1-3", "4-6", "7-10", "11+"];
  return Object.fromEntries(
    order.map((band) => [band, summarize(records.filter((record) => ticketBand(record.publication.tickets.length) === band))]),
  );
}

function buildPayoutHistory(records) {
  const formulas = [...new Set(records.map((record) => String(record.publication.formula)))].sort(
    (left, right) => Number(left) - Number(right),
  );
  return Object.fromEntries(
    formulas.map((formula) => {
      const formulaRecords = records.filter((record) => String(record.publication.formula) === formula);
      const minimumPaid = formulaRecords.map((record) =>
        Math.min(...record.result.payouts.map((payout) => payout.correctSelections)),
      );
      const tiers = new Map();
      for (const record of formulaRecords) {
        for (const payout of record.result.payouts) {
          const amounts = tiers.get(payout.correctSelections) ?? [];
          amounts.push(payout.amountCents);
          tiers.set(payout.correctSelections, amounts);
        }
      }
      return [
        formula,
        {
          observedGrids: formulaRecords.length,
          minimumPaidCorrectSelections: {
            minimum: minimumPaid.length ? Math.min(...minimumPaid) : 0,
            median: round(median(minimumPaid), 1),
            maximum: minimumPaid.length ? Math.max(...minimumPaid) : 0,
          },
          payoutCentsByCorrectSelections: Object.fromEntries(
            [...tiers.entries()]
              .sort((left, right) => right[0] - left[0])
              .map(([correctSelections, amounts]) => [
                String(correctSelections),
                {
                  observations: amounts.length,
                  minimum: Math.min(...amounts),
                  median: Math.round(median(amounts)),
                  average: Math.round(mean(amounts)),
                  maximum: Math.max(...amounts),
                },
              ]),
          ),
        },
      ];
    }),
  );
}

function buildPerFormula(records) {
  return Object.fromEntries(
    [7, 8, 12, 15].map((formula) => [
      String(formula),
      summarize(records.filter((record) => record.publication.formula === formula)),
    ]),
  );
}

function buildSignals(records) {
  const summary = summarize(records);
  const selections = buildSelectionStats(records);
  const calibration = buildCalibration(records);
  return {
    drawCoverageGapPct: selections.coverageGapPct.N,
    homeCoverageGapPct: selections.coverageGapPct["1"],
    awayCoverageGapPct: selections.coverageGapPct["2"],
    topPredictionCalibrationGapPct: calibration.calibrationGapPct,
    portfolioCoverageVsBestTicketGapPct: round(
      summary.portfolioOutcomeCoveragePct - summary.bestTicketAccuracyPct,
      1,
    ),
    additionalTicketsImprovedBestScoreRatePct: summary.additionalTicketsImprovedBestScoreRatePct,
    averageBestScoreGainFromAdditionalTickets: summary.averageBestScoreGainFromAdditionalTickets,
    averagePairwiseTicketDistancePct: summary.averagePairwiseTicketDistancePct,
  };
}

const publications = await readJsonDirectory(PUBLICATIONS_DIR);
const results = await readJsonDirectory(RESULTS_DIR);
const publicationById = new Map(publications.map((publication) => [publication.id, publication]));

const records = results
  .map((result) => {
    const publication = publicationById.get(result.publicationId);
    if (!publication) {
      throw new Error(`Publication introuvable pour le résultat ${result.id}.`);
    }
    return buildRecord(publication, result);
  })
  .sort((left, right) => new Date(left.result.settledAt) - new Date(right.result.settledAt));

const recentRecords = records.slice(-20);
const latestSettledAt = records.length ? records[records.length - 1].result.settledAt : null;

const output = {
  schemaVersion: 1,
  purpose:
    "Mémoire statistique déterministe pour calibrer l'analyse et la construction des combinaisons. Ce fichier ne remplace jamais l'analyse sportive de la grille courante.",
  source: {
    publicationFiles: publications.length,
    resultFiles: results.length,
    settledPublications: records.length,
    latestSettledAt,
  },
  allTime: {
    summary: summarize(records),
    byFormula: buildPerFormula(records),
    selectionDistribution: buildSelectionStats(records),
    calibration: buildCalibration(records),
    byTicketCount: buildTicketBands(records),
    payoutHistory: buildPayoutHistory(records),
    strategySignals: buildSignals(records),
  },
  recent20: {
    summary: summarize(recentRecords),
    selectionDistribution: buildSelectionStats(recentRecords),
    calibration: buildCalibration(recentRecords),
    strategySignals: buildSignals(recentRecords),
  },
  metricNotes: {
    yieldPct: "(retours - mises) / mises, en pourcentage.",
    bestTicketAccuracyPct:
      "Somme des meilleurs scores de chaque grille divisée par le nombre total de matchs réglés.",
    portfolioOutcomeCoveragePct:
      "Part des matchs pour lesquels au moins une combinaison publiée contenait le résultat officiel, indépendamment du fait que ces bons choix soient réunis sur une même combinaison.",
    coverageGapPct:
      "Part du choix dans les combinaisons publiées moins sa part dans les résultats officiels. Une valeur négative signifie une sous-couverture historique.",
    calibrationGapPct:
      "Taux de réussite réel moins probabilité moyenne annoncée du choix 1N2 le plus probable. Une valeur négative indique une surconfiance historique.",
    payoutHistory:
      "Historique descriptif des rapports officiels observés. Il sert de repère et ne prédit pas les futurs rapports FDJ.",
  },
};

await writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Statistiques Loto Foot écrites dans ${path.relative(ROOT_DIR, OUTPUT_FILE)}.`);
console.log(`SETTLED_PUBLICATIONS=${records.length}`);
console.log(`LATEST_SETTLED_AT=${latestSettledAt ?? "none"}`);
