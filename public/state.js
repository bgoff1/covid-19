const app = new Vue({
  el: "#app",
  data: {
    states: [],
    showStates: true,
    type: "State",
    lastCollection: "",
  },
  created: function () {
    window.onpopstate = (event) => {
      this.loadCorrect(event.state);
    };
    this.loadCorrect(new URLSearchParams(location.search).get("state"));
  },
  methods: {
    focusState: function (event, pushState = true) {
      fetch("http://localhost:8080/state/counties/" + event)
        .then((res) => res.json())
        .then((res) => {
          this.type = event.toLowerCase() === "louisiana" ? "Parish" : "County";
          this.states = res.sort((a, b) => b.value - a.value);
          if (pushState) {
            history.pushState(event, event, "?state=" + event);
          }
        });
    },
    loadStates: function () {
      fetch("http://localhost:8080/states")
        .then((res) => res.json())
        .then((res) => {
          this.states = res.sort((a, b) => b.value - a.value);
          history.pushState("all", "States", "?state=all");
        });
    },
    loadCorrect: function (state) {
      if (state && state.toLowerCase() !== "all") {
        this.focusState(state, false);
      } else {
        this.loadStates();
      }
      fetch("http://localhost:8080/last-update")
        .then((res) => res.text())
        .then((res) => {
          const date = new Date(res);
          const month = date.getMonth() + 1;
          const day = date.getDate() + 1;
          const year = date.getFullYear();
          this.lastCollection = `${month}/${day}/${year}`; // + " at " + date.toLocaleTimeString();
        });
    },
  },
});