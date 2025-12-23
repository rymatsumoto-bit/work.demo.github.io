

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ===============================
// Supabase client
// ===============================
const SUPABASE_URL = "https://kdwxugydvjdoaxwjhqqk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkd3h1Z3lkdmpkb2F4d2pocXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzE4NDAsImV4cCI6MjA4MDQ0Nzg0MH0.MfPhBS6SV1wKL8QXu_Bo5iP1rVyrsS4XaqAm69NQMKA";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("JS loaded");

(async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");

  const { data, error } = await supabase
    .from("position")
    .select("position_key")
    .limit(1);

  if (error) {
    console.error("❌ Supabase connection failed:", error);
  } else {
    console.log("✅ Supabase connected. Sample data:", data);
  }
})();


// ===============================
// DOM elements
// ===============================
const loadBtn = document.getElementById("loadBtn");
const tbody = document.querySelector("#positionsTable tbody");

// ===============================
// Event listeners
// ===============================
loadBtn.addEventListener("click", loadPositions);

// ===============================
// Main loader
// ===============================
async function loadPositions() {
  const { data, error } = await supabase
    .from("current_positions_view")
    .select("*")
    ;

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  tbody.innerHTML = "";

  data.forEach(pos => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${pos.holder_id ?? ""}</td>
      <td>${pos.client_id ?? ""}</td>
      <td>${pos.ticker ?? ""}</td>
      <td>${pos.name}</td>
      <td>${formatNumber(pos.notional)}</td>
      <td>${pos.notional_ccy ?? ""}</td>
      <td>${formatNumber(pos.last_security_price)}</td>
      <td>${formatNumber(pos.market_value)}</td>
    `;
    tbody.appendChild(row);
  });
}

// ===============================
// Helpers
// ===============================
function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
