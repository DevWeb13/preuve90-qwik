import { describe, expect, it } from "vitest";
import { parseOfficialSelections, parsePayouts } from "./settle-loto-foot.mjs";

const matches = [
  { position: 1, homeTeam: "Equipe A", awayTeam: "Equipe B" },
  { position: 2, homeTeam: "Equipe C", awayTeam: "Equipe D" },
];

describe("lecture des résultats officiels FDJ", () => {
  it("lit les choix cochés entre les équipes", () => {
    const html = `
      <div>
        Equipe A
        <input type="radio" value="1" disabled>
        <input type="radio" value="N" checked disabled>
        <input type="radio" value="2" disabled>
        Equipe B
      </div>
      <div>
        Equipe C
        <input type="radio" value="1" checked disabled>
        <input type="radio" value="N" disabled>
        <input type="radio" value="2" disabled>
        Equipe D
      </div>
    `;

    expect(parseOfficialSelections(html, matches)).toEqual([
      { position: 1, selection: "N" },
      { position: 2, selection: "1" },
    ]);
  });

  it("lit aussi un choix indiqué par une classe gagnante", () => {
    const html = `
      <div>Equipe A <span>1</span><span class="is-winning">N</span><span>2</span> Equipe B</div>
      <div>Equipe C <span class="selected">1</span><span>N</span><span>2</span> Equipe D</div>
    `;

    expect(parseOfficialSelections(html, matches)).toEqual([
      { position: 1, selection: "N" },
      { position: 2, selection: "1" },
    ]);
  });

  it("refuse une page incomplète au lieu d'inventer des résultats", () => {
    const html = `
      <div>Equipe A <input value="1"><input value="N"><input value="2"> Equipe B</div>
      <div>Equipe C <input value="1"><input value="N"><input value="2"> Equipe D</div>
    `;

    expect(parseOfficialSelections(html, matches)).toEqual([]);
  });
});

describe("lecture des rapports FDJ", () => {
  it("convertit les montants français en centimes", () => {
    const html = `
      <table>
        <tr><td>12 sur 12</td><td>0</td><td>--</td></tr>
        <tr><td>11 sur 12</td><td>11</td><td>1 732,00 €</td></tr>
        <tr><td>10 sur 12</td><td>122</td><td>156,10 €</td></tr>
      </table>
    `;

    expect(parsePayouts(html)).toEqual([
      { correctSelections: 11, amountCents: 173_200 },
      { correctSelections: 10, amountCents: 15_610 },
    ]);
  });
});
