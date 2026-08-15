import { describe, expect, it } from "vitest";
import { parseRenderedOfficialResults } from "./settle-loto-foot-rendered.mjs";

const matches = [
  { position: 1, homeTeam: "Equipe A", awayTeam: "Equipe B" },
  { position: 2, homeTeam: "Equipe C", awayTeam: "Equipe D" },
];

describe("lecture des rencontres neutralisées FDJ", () => {
  it("conserve les résultats 1/N/2 normaux", () => {
    const html = `
      <div>
        Equipe A
        <input value="1">
        <input value="N" checked>
        <input value="2">
        Equipe B
      </div>
      <div>
        Equipe C
        <input value="1" checked>
        <input value="N">
        <input value="2">
        Equipe D
      </div>
      <table><tr><td>2 sur 2</td><td>100,00 €</td></tr></table>
    `;

    expect(parseRenderedOfficialResults(html, matches)).toEqual([
      { position: 1, selection: "N" },
      { position: 2, selection: "1" },
    ]);
  });

  it("lit la grille rendue sans dépendre des libellés d'équipes", () => {
    const html = `
      <div class="controls">
        <input formcontrolname="one" value="1">
        <input formcontrolname="n" value="N" checked>
        <input formcontrolname="two" value="2">
        <input formcontrolname="one" value="1" checked>
        <input formcontrolname="n" value="N">
        <input formcontrolname="two" value="2">
      </div>
      <div>Libellés FDJ différents de ceux de la publication</div>
      <table><tr><td>2 sur 2</td><td>100,00 €</td></tr></table>
    `;

    expect(parseRenderedOfficialResults(html, matches)).toEqual([
      { position: 1, selection: "N" },
      { position: 2, selection: "1" },
    ]);
  });

  it("reconnaît une rencontre explicitement marquée Gagnant", () => {
    const html = `
      <div>
        Equipe A
        <input value="1" checked>
        <input value="N">
        <input value="2">
        Equipe B
      </div>
      <div>Equipe C <input value="Gagnant"> Equipe D</div>
      <table><tr><td>2 sur 2</td><td>100,00 €</td></tr></table>
    `;

    expect(parseRenderedOfficialResults(html, matches)).toEqual([
      { position: 1, selection: "1" },
      { position: 2, selection: "G" },
    ]);
  });

  it("déduit une rencontre retirée si les rapports réduisent le dénominateur", () => {
    const html = `
      <div>
        Equipe A
        <input value="1" checked>
        <input value="N">
        <input value="2">
        Equipe B
      </div>
      <table>
        <tr><td>2 sur 1</td><td>100,00 €</td></tr>
        <tr><td>1 sur 1</td><td>10,00 €</td></tr>
      </table>
    `;

    expect(parseRenderedOfficialResults(html, matches)).toEqual([
      { position: 1, selection: "1" },
      { position: 2, selection: "G" },
    ]);
  });

  it("refuse d'inventer une neutralisation si les rapports attendent tous les matchs", () => {
    const html = `
      <div>
        Equipe A
        <input value="1" checked>
        <input value="N">
        <input value="2">
        Equipe B
      </div>
      <div>
        Equipe C
        <input value="1">
        <input value="N">
        <input value="2">
        Equipe D
      </div>
      <table><tr><td>2 sur 2</td><td>100,00 €</td></tr></table>
    `;

    expect(parseRenderedOfficialResults(html, matches)).toEqual([]);
  });
});
