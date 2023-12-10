export default class presuTracker {
    constructor(querySelectorString) {
        this.root = document.querySelector(querySelectorString);
        this.root.innerHTML = presuTracker.html();

        this.root.querySelector(".nuevoLog").addEventListener("click", () => {
            this.btnClicNuevoLog();
        });

        // Load initial data from Local Storage
        this.load();
    }

    static html() {
        return `
        <table class="presuTracker">
             <thead>
                 <tr>
                     <th>Día</th>
                     <th>Descripción</th>
                     <th>Tipo</th>
                     <th>Cantidad</th>
                     <th></th>
                 </tr>
             </thead>
             <tbody class="presuLoggear">
             </tbody>
             <tbody>
                 <tr>
                     <td colspan="5" class="controles">
                         <button type="button" class="nuevoLog">Agregar</button>
                     </td>
                 </tr>
             </tbody>
             <tfoot>
                 <tr>
                     <td colspan="5" class="resumen">
                         <strong>Total:</strong>
                         <span class="total">$0,00</span>
                     </td>
                 </tr>
             </tfoot>
         </table>
        `;
    }

    static loggearHtml() {
        return `
        <tr>
         <td>
             <input class="input inputDia" type="date">
         </td>
         <td>
             <input class="input inputDescribir" type="text" placeholder="Alquiler, sueldo, etc.">
         </td>
         <td>
             <select class="input inputTipo">
                 <option value="ingreso">Ingreso</option>
                 <option value="gastos">Gasto</option>
             </select>
         </td>
         <td>
             <input class="input inputNum" type="number">
         </td>
         <td>
             <button type="button" class="borrar"><i class="bi bi-trash3"></i></button>
         </td>
     </tr>
        `;
    }

    load() {
        const loggeos = JSON.parse(localStorage.getItem("logs-de-tracker") || "[]");

        for (const loggeo of loggeos) {
            this.agregarLog(loggeo);
        }

        this.actualizarResumen();
    }

    actualizarResumen() {
        const total = this.getFilaLog().reduce((total, row) => {
            const num = row.querySelector(".inputNum").value;
            const esGasto = row.querySelector(".inputTipo").value === "gastos";
            const modificador = esGasto ? -1 : 1;

            return total + (num * modificador);
        }, 0);

        const totalFormato = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(total);

        this.root.querySelector(".total").textContent = totalFormato;
    }

    save() {
        const data = this.getFilaLog().map(row => {
            return {
                dia: row.querySelector(".inputDia").value,
                describir: row.querySelector(".inputDescribir").value,
                tipo: row.querySelector(".inputTipo").value,
                num: parseFloat(row.querySelector(".inputNum").value),
            };
        });

        localStorage.setItem("logs-de-tracker", JSON.stringify(data));
        this.actualizarResumen();
    }

    agregarLog(loggeo = {}) {
        this.root.querySelector(".presuLoggear").insertAdjacentHTML("beforeend", presuTracker.loggearHtml());

        const row = this.root.querySelector(".presuLoggear tr:last-of-type");

        row.querySelector(".inputDia").value = loggeo.dia || new Date().toISOString().replace(/T.*/, "");
        row.querySelector(".inputDescribir").value = loggeo.describir || "";
        row.querySelector(".inputTipo").value = loggeo.tipo || "ingreso";
        row.querySelector(".inputNum").value = loggeo.num || 0;
        row.querySelector(".borrar").addEventListener("click", e => {
            this.btnClicBorrar(e);
        });

        row.querySelectorAll(".input").forEach(input => {
            input.addEventListener("change", () => this.save());
        });
    }

    getFilaLog() {
        return Array.from(this.root.querySelectorAll(".presuLoggear tr"));
    }

    btnClicNuevoLog() {
        this.agregarLog();
    }

    btnClicBorrar(e) {
        e.target.closest("tr").remove();
        this.save();
    }
}