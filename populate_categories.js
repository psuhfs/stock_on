document.addEventListener("DOMContentLoaded", async function() {
    const locationDropdown = document.getElementById("location-dropdown")
    const areaDropdown = document.getElementById("area-dropdown")
    const categoryDropdown = document.getElementById("category-dropdown")
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
        areaDropdown.innerHTML = "<option value=\"\">Select Area</option>"
        categoryDropdown.innerHTML = "<option value=\"\">Select Category</option>"
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

    // Area Dropdown Change Event
    areaDropdown.addEventListener("change", function() {
        // Clear previous category dropdown and items
        categoryDropdown.innerHTML = "<option value=\"\">Select Category</option>"
        itemsContainer.innerHTML = ""

        const selectedLocation = locationDropdown.value
        const selectedArea = this.value
        if (!selectedLocation || !selectedArea) return

        // Find the selected area in the location
        const area = categoriesData[selectedLocation].areas.find(a => a.name === selectedArea)

        // Populate Category Dropdown with keys from the area's info
        Object.keys(area.info).forEach(categoryName => {
            const option = document.createElement("option")
            option.value = categoryName
            option.textContent = categoryName
            categoryDropdown.appendChild(option)
        })
    })

    // Category Dropdown Change Event
    categoryDropdown.addEventListener("change", function() {
        // Clear previous items
        itemsContainer.innerHTML = ""

        const selectedLocation = locationDropdown.value
        const selectedArea = areaDropdown.value
        const selectedCategory = this.value

        if (!selectedLocation || !selectedArea || !selectedCategory) return

        // Find the selected area in the location
        const area = categoriesData[selectedLocation].areas.find(a => a.name === selectedArea)

        // Get items for the selected category
        const categoryItems = area.info[selectedCategory]

        // Create item display
        const itemDiv = document.createElement("div")
        itemDiv.classList.add("item")
        itemDiv.innerHTML = `
                    <h3>${categoryItems.name}</h3>
                    <p>Item ID: ${categoryItems.item_id}</p>
                    <p>Unit Size: ${categoryItems.unit_sz}</p>
                `

        itemsContainer.appendChild(itemDiv)
    })

})