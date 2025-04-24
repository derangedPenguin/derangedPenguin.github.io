class SpanValue {
    constructor(starting_val, span_key, transform = ((a)=>a), bounds=null ) {
        this.val = starting_val;
        this.transform = transform;
        this.span_key = span_key; // stored for identification/saving
        this.span_elem = document.getElementById(span_key);
        this.bounds = bounds;

        this.set(starting_val);  // force visual update
        saved_vals.push(this);   // so this val will be saved when save() is called
    };
    get() { // would likely be better by using real get/sets, but i dumb & have recursion issue
        return this.transform(+this.val.toFixed(2));
    };
    set(new_val) {
        if (this.bounds !== null) {
            this.val = Math.max(Math.min(Number(new_val), this.bounds[1]), this.bounds[0]);
        } else {
            this.val = Number(new_val);
        }
        this.span_elem.innerText = this.get();
    };
    add(new_val) {
        this.set(this.val + Number(new_val));
    };
};

//full scope inits
let saved_vals = []

let total_things = undefined

let posessed_money = undefined
let posessed_things = undefined
let thing_market_value = undefined
let thing_sale_price = undefined

let material_cost_per_thing = undefined
let posessed_materials = undefined
let material_purchase_amount = undefined
let material_cost = undefined


let thing_producers = undefined
let thing_producer_cost = undefined
let thing_producer_speed = undefined

let marketing_budget = undefined

function base_initialize() {
    // SpanValues
    total_things = new SpanValue(0, "total-things", (a)=>Math.floor(a))
    
    posessed_money = new SpanValue(100, "posessed-money");
    
    posessed_things = new SpanValue(0, "posessed-things", (a)=>Math.floor(a));
    thing_market_value = new SpanValue(0.5, "thing-market-value");
    thing_sale_price = new SpanValue(0.5, "thing-sale-price", undefined, [0,Infinity]);
    
    material_cost_per_thing = new SpanValue(10, "material-cost-per-thing");
    posessed_materials = new SpanValue(0, "posessed-materials");
    material_purchase_amount = new SpanValue(1500, "material-purchase-amount");
    material_cost = new SpanValue(20, "material-cost");

    thing_producers = new SpanValue(0, "thing-producers");
    thing_producer_cost = new SpanValue(10, "thing-producer-cost");
    
    marketing_budget = new SpanValue(0, "marketing-budget", undefined, [0,100]);

    research_budget = new SpanValue(0, "research-budget", undefined, [0,100]);
    //Calced Values
    thing_producer_speed = 0.25;
}

const calced_spans = {
    "thing-production": ()=>thing_producers.get() * thing_producer_speed
}

// HTML Element Inits
window.addEventListener("DOMContentLoaded", () => {
    base_initialize();
    // document.getElementById("header").scrollTop = document.getElementById("header").scrollHeight
    document.getElementById("terminal-cursor").scrollIntoView(true)
})

setInterval(() => {
    //Functions
    produce_things(thing_producers.get() * thing_producer_speed / 10);
    
    // Display
    for (key in calced_spans) {
        document.getElementById(key).innerText = calced_spans[key]()
    }
}, 100);//milliseconds

function add_terminal_entry(text) {
    var term_entries = document.getElementById("header-terminal") 
    console.log(term_entries.childElementCount)
    console.log(term_entries.children)
    term_entries.innerHTML += `<span class="terminal-entry typed" style="--n:${2+text.length}">> ${text}</span><br>` //•
    
    var prev_entry = term_entries.children[term_entries.childElementCount - 2]
    prev_entry.classList.remove("typed")
    prev_entry.innerText = '•' +  prev_entry.innerText.substring(1, prev_entry.innerText.length)

    term_entries.lastChild.scrollIntoView(true)
}

function produce_things(amount) {
    // add_terminal_entry(amount)
    var materials_used = amount*material_cost_per_thing

    if (materials_used <= posessed_materials.get()) {
        // console.log(materials_used)
        // console.log("hi")
        posessed_things.add(amount)
        total_things.add(amount)

    } else if (posessed_materials.get() >= material_cost_per_thing.get()) {
        // console.log("hi2")
        amount = Math.floor(posessed_materials.get() / material_cost_per_thing.get())
        materials_used = amount * material_cost_per_thing.get()

        posessed_things.add(amount)
        total_things.add(amount)
    } else {
        return
    }
    posessed_materials.add(-materials_used)
}
//Buttons
function buy_thing_producer() {
    if (posessed_money.get() >= thing_producer_cost.get()) {
        posessed_money.add(-thing_producer_cost.get())
        thing_producers.add(1)
    }
}
function buy_materials() {
    if (posessed_money.get() >= material_cost.get()) {
        posessed_money.add(-material_cost.get())
        posessed_materials.add(material_purchase_amount.get())
    }
}

// Debug Buttons
function reset_save() {
    base_initialize()
    save()
    location.reload()
}

// Handle Saving Data
function save() {
    for (spanVal of saved_vals) {
        localStorage.setItem(spanVal.span_key, spanVal.val)
    }
}
function load() {
    for (spanVal of saved_vals) {
        spanVal.set(localStorage.getItem(spanVal.span_key))
    }
}
window.addEventListener("visibilitychange", ()=>{
    if (document.visibilityState == "hidden") {save()} //runs when page may close, weird for handling mobile
})
window.addEventListener("DOMContentLoaded", load)

