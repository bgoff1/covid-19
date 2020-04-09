import fetch from "node-fetch";

const countyURL =
  "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";

const stateURL =
  "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv";

export class CountyItem {
  date: Date;
  county: string;
  state: string;
  fips: number;
  cases: number;
  deaths: number;

  constructor(rowData: string[]) {
    this.date = new Date(rowData[0]);
    this.county = rowData[1];
    this.state = rowData[2];
    this.fips = +rowData[3];
    this.cases = +rowData[4];
    this.deaths = +rowData[5];
  }
}

export class StateItem {
  // date,state,fips,cases,deaths
  date: Date;
  state: string;
  fips: number;
  cases: number;
  deaths: number;
  constructor(rowData: string[]) {
    this.date = new Date(rowData[0]);
    this.state = rowData[1];
    this.fips = +rowData[2];
    this.cases = +rowData[3];
    this.deaths = +rowData[4];
  }
}

export function getCounties(): Promise<CountyItem[]> {
  return fetch(countyURL)
    .then((res) => res.text())
    .then((res) => {
      const data = res
        .split("\n")
        .map((item) => item.split(","))
        .slice(1);
      return data.map((item) => new CountyItem(item));
    });
}

export function getStates(): Promise<StateItem[]> {
  return fetch(stateURL)
    .then((res) => res.text())
    .then((res) => {
      const data = res
        .split("\n")
        .map((item) => item.split(","))
        .slice(1);
      return data.map((item) => new StateItem(item));
    });
}
