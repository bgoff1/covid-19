// import fastify from "fastify";
import express from "express";
// import path from "path";
import { getCounties, getStates, CountyItem, StateItem } from "./fetch";

let countyData: CountyItem[] = [];
let stateData: StateItem[] = [];

const port = process.env.PORT || 8080;
// const app = fastify({ logger: false });
const app = express();

// app.register(require("fastify-static"), {
//   root: path.join(__dirname, "..", "public"),
// });

function formatSums(sums: { [key: string]: any }) {
  return Object.keys(sums).map((item) => ({
    name: item,
    value: sums[item].cases || sums[item],
  }));
}

app.get("/counties/:county", async (req, res) => {
  try {
    countyData = await getCounties();
    const county = req.params.county?.toLowerCase();
    if (county) {
      const result = countyData.filter(
        (item) => item.county.toLowerCase() === county
      );
      return result;
    } else {
      res.status(400).send("Missing County Name");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/state/counties/:state", async (req, res) => {
  try {
    countyData = await getCounties();
    res.send(
      formatSums(
        countyData
          .filter(
            (county) =>
              county.state.toLowerCase() === req.params.state?.toLowerCase()
          )
          .reduce((totals, item) => {
            return {
              ...totals,
              [item.county]:
                totals[item.county] && totals[item.county].date > item.date
                  ? totals[item.county]
                  : { date: item.date, cases: item.cases },
            };
          }, {} as { [state: string]: { date: Date; cases: number } })
      )
    );
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/last-update", async (req, res) => {
  try {
    if (countyData) {
      res.send(
        new Date(
          Math.max.apply(
            null,
            countyData.map((e) => new Date(e.date).valueOf())
          )
        )
      );
      // countyData
      //   .reduce((m, v, i) => (v.date > m.date && i ? v : m), {} as any)
      //   .date.toISOString()
      // );
    } else {
      throw new Error();
    }
  } catch (err) {
    res.status(500).send("County Data not yet loaded" + err);
    getCounties()
      .then((res) => {
        countyData = res;
      })
      .catch((err) => {
        console.error(err);
      });
    getStates()
      .then((res) => {
        stateData = res;
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

app.get("/states", async (req, res) => {
  try {
    stateData = await getStates();
    res.send(
      formatSums(
        stateData.reduce(
          (totals, item) => ({
            ...totals,
            [item.state]:
              totals[item.state] && totals[item.state].date > item.date
                ? totals[item.state]
                : { date: item.date, cases: item.cases },
          }),
          {} as { [state: string]: { date: Date; cases: number } }
        )
      )
    );
  } catch (err) {
    res.status(500).send(err);
  }
});

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
  getCounties()
    .then((res) => {
      countyData = res;
    })
    .catch((err) => {
      console.error(err);
    });
  getStates()
    .then((res) => {
      stateData = res;
    })
    .catch((err) => {
      console.error(err);
    });
});
