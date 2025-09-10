// Small product database: barcode -> ingredient list
let barcodeDatabase = {
  "0123456789012": ["water", "glycerin", "parabens"],
  "0987654321098": ["sulfates", "alcohol", "fragrance"],
  "1111111111111": ["water", "fragrance", "glycerin"],
  "2222222222222": ["sulfates", "glycerin"],
  "3333333333333": ["parabens", "alcohol"]
};

// Global ingredient database (loaded from JSON)
let ingredientDatabase = {};

// Load JSON when page loads
fetch("ingredients.json")
  .then(response => response.json())
  .then(data => {
    ingredientDatabase = data;
    console.log("Ingredient database loaded:", ingredientDatabase);
  })
  .catch(error => console.error("Error loading ingredient database:", error));


// Analyze ingredients (pasted or from barcode)
function analyzeIngredients(ingredientsInput = null) {
  let ingredients;
  if (ingredientsInput) {
    ingredients = ingredientsInput;
  } else {
    const input = document.getElementById("ingredientsInput").value;
    ingredients = input.split(",").map(i => i.trim().toLowerCase());
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  let badFound = [];

  ingredients.forEach(ing => {
    if (ingredientDatabase[ing] && ingredientDatabase[ing].risk.toLowerCase() === "avoid") {
      badFound.push(`<p class="avoid"><strong>${ing}</strong> - ${ingredientDatabase[ing].note}</p>`);
    } else if (ingredientDatabase[ing] && ingredientDatabase[ing].risk.toLowerCase() === "caution") {
      badFound.push(`<p class="caution"><strong>${ing}</strong> - ${ingredientDatabase[ing].note}</p>`);
    }
  });

  if (badFound.length > 0) {
    resultsDiv.innerHTML = `<h3>⚠️ This product contains risky ingredients:</h3>` + badFound.join("");
  } else {
    resultsDiv.innerHTML = `<h3 class="safe">✅ Good product! No risky ingredients found.</h3>`;
  }
}


// Barcode scanner
function startScanner() {
    const scannerContainer = document.getElementById('scanner-container');
    scannerContainer.innerHTML = ''; // Clear previous instances

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerContainer,
            constraints: {
                width: 480,
                height: 300,
                facingMode: "environment" // back camera
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        decoder: {
            readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error(err);
            alert("Error initializing scanner: " + err);
            return;
        }
        Quagga.start();
        console.log("Scanner started");
    });

    Quagga.onDetected(function(result) {
        const barcode = result.codeResult.code;
        console.log("Detected barcode:", barcode);

        Quagga.stop(); // Stop scanning after detection

        if (barcodeDatabase[barcode]) {
            analyzeIngredients(barcodeDatabase[barcode]);
        } else {
            alert("Product not in database");
        }
    });
}

