document.addEventListener("DOMContentLoaded", async function() {
    const locationDropdown = document.getElementById("location-dropdown")
    const areaDropdown = document.getElementById("area-dropdown")
    const itemsContainer = document.getElementById("items-container")

    let categoriesData = null

    const resp = await apiCallGet(`${BASE_URL}/stockon/getItems`)
    if (!resp.ok) {
        if (resp.status === 401) {
            alert("Unauthorized, redirecting to login page.")
        } else {
            alert("Something went wrong, redirecting to login page.")
        }
        navigate("/login")
    }

    const data = await resp.json()
    categoriesData = data

    // Global array to track item quantities
    window.stockonItemQuantities = []

    // Create submit button
    const submitButton = document.createElement("button")
    submitButton.id = "stockon-submit-btn"
    submitButton.textContent = "Submit"
    submitButton.classList.add("submit-btn")
    submitButton.style.position = "fixed"
    submitButton.style.bottom = "20px"
    submitButton.style.right = "20px"
    submitButton.style.zIndex = "1000"
    submitButton.style.backgroundColor = "#28a745"
    submitButton.style.color = "white"
    submitButton.style.border = "none"
    submitButton.style.padding = "10px 20px"
    submitButton.style.borderRadius = "5px"
    submitButton.style.cursor = "pointer"
    submitButton.style.display = "none" // Initially hidden

    submitButton.addEventListener("click", () => {
        alert("submitted")
    })

    document.body.appendChild(submitButton)

    // Populate Location Dropdown
    Object.keys(data).forEach(locationName => {
        const option = document.createElement("option")
        option.value = locationName
        option.textContent = locationName
        locationDropdown.appendChild(option)
    })

    // Location Dropdown Change Event
    locationDropdown.addEventListener("change", function() {
        // Clear previous area and category dropdowns
        areaDropdown.innerHTML = "<option value=''>Select Area</option>"
        itemsContainer.innerHTML = ""

        const selectedLocation = this.value
        if (!selectedLocation) return

        // Populate Area Dropdown
        data[selectedLocation].areas.forEach(area => {
            const option = document.createElement("option")
            option.value = area.name
            option.textContent = area.name
            areaDropdown.appendChild(option)
        })
    })

    // Function to update item quantities array
    function updateItemQuantity(item, location, area, category, quantity) {
        const existingItemIndex = window.stockonItemQuantities.findIndex(
            q => q.item_id === item.item_id &&
                q.location === location &&
                q.area === area
        )

        const itemQuantityEntry = {
            location: location,
            area: area,
            category: category,
            item_id: item.item_id,
            name: item.name,
            unit_sz: item.unit_sz,
            quantity: quantity
        }

        if (existingItemIndex !== -1) {
            if (quantity === 0) {
                window.stockonItemQuantities.splice(existingItemIndex, 1)
            } else {
                window.stockonItemQuantities[existingItemIndex] = itemQuantityEntry
            }
        } else {
            window.stockonItemQuantities.push(itemQuantityEntry)
        }

        // Show submit button if there are quantities
        const submitBtn = document.getElementById("stockon-submit-btn")
        submitBtn.style.display = window.stockonItemQuantities.length > 0 ? "block" : "none"
    }

    // Area Dropdown Change Event
    areaDropdown.addEventListener("change", function() {
        // Clear previous categories and items
        const categoriesContainer = document.getElementById("categories-container")
        categoriesContainer.innerHTML = ""
        itemsContainer.innerHTML = ""

        const selectedLocation = locationDropdown.value
        const selectedArea = this.value
        if (!selectedLocation || !selectedArea) return

        // Find the selected area in the location
        const area = categoriesData[selectedLocation].areas.find(a => a.name === selectedArea)

        // Create category cards
        Object.keys(area.info).forEach(categoryName => {
            const categoryCard = document.createElement("div")
            categoryCard.classList.add("category-card")
            categoryCard.textContent = categoryName

            categoryCard.addEventListener("click", function() {
                // Remove 'selected' class from all cards
                document.querySelectorAll(".category-card").forEach(card => {
                    card.classList.remove("selected")
                })

                // Add 'selected' class to clicked card
                this.classList.add("selected")

                // Clear previous items
                itemsContainer.innerHTML = ""

                // Get items for the selected category
                const categoryItems = area.info[categoryName]

                // Handle multiple items or a single item
                const itemsToDisplay = Array.isArray(categoryItems) ? categoryItems : [categoryItems]

                // Create item display for each item
                itemsToDisplay.forEach(item => {
                    const itemDiv = document.createElement("div")
                    itemDiv.classList.add("item")

                    // Find existing quantity or set to 0
                    const existingItemIndex = window.stockonItemQuantities.findIndex(
                        q => q.item_id === item.item_id &&
                            q.location === selectedLocation &&
                            q.area === selectedArea
                    )

                    const initialQuantity = existingItemIndex !== -1 ?
                        window.stockonItemQuantities[existingItemIndex].quantity : 0

                    itemDiv.innerHTML = `
                        <h3>${item.name}</h3>
                        <p>Item ID: ${item.item_id}</p>
                        <p>Unit Size: ${item.unit_sz}</p>
                        <div class="quantity-controls">
                            <button class="decrement-btn" data-item-id="${item.item_id}">-</button>
                            <span class="quantity">${initialQuantity}</span>
                            <button class="increment-btn" data-item-id="${item.item_id}">+</button>
                        </div>
                    `

                    itemsContainer.appendChild(itemDiv)

                    // Add event listeners for increment/decrement
                    const incrementBtn = itemDiv.querySelector(".increment-btn")
                    const decrementBtn = itemDiv.querySelector(".decrement-btn")
                    const quantitySpan = itemDiv.querySelector(".quantity")

                    incrementBtn.addEventListener("click", () => {
                        const currentQuantity = parseInt(quantitySpan.textContent)
                        const newQuantity = currentQuantity + 1
                        quantitySpan.textContent = newQuantity

                        updateItemQuantity(item, selectedLocation, selectedArea, categoryName, newQuantity)
                    })

                    decrementBtn.addEventListener("click", () => {
                        const currentQuantity = parseInt(quantitySpan.textContent)
                        const newQuantity = Math.max(0, currentQuantity - 1)
                        quantitySpan.textContent = newQuantity

                        updateItemQuantity(item, selectedLocation, selectedArea, categoryName, newQuantity)
                    })
                })
            })

            categoriesContainer.appendChild(categoryCard)
        })
    })
})