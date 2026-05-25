type Currency = "rub";
type Money = { amount: number; currency: Currency }
type InvoiceStatus = "draft" | "issued" | "paid" | "void"

interface Billable {
    title: string
    total(): Money
}

abstract class InvoiceLine implements Billable {
    public readonly title: string
    protected constructor(title: string, protected readonly qty: number) {
        this.title = title
    }
    protected abstract unitPrice(): Money
    public total(): Money {
        const price = this.unitPrice()
        return { amount: price.amount * this.qty, currency: price.currency }
    }
}

class LaborLine extends InvoiceLine {
    constructor(title: string, qtyHours: number, private readonly rubPerHour: number) {
        super(title, qtyHours)
    }
    protected unitPrice(): Money {
        return { amount: this.rubPerHour, currency: "rub" }
    }
}

// вариант 2 - класс для запчастей с наценкой
class PartLine extends InvoiceLine {
    constructor(
        title: string, 
        qty: number, 
        private readonly pricePerUnit: number,
        private readonly markupPercent: number // процент наценки
    ) {
        super(title, qty)
    }
    protected unitPrice(): Money {
        return { amount: this.pricePerUnit, currency: "rub" }
    }

    public total(): Money {
        const baseTotal = super.total() 
        const markup = (baseTotal.amount * this.markupPercent) / 100
        return { amount: baseTotal.amount + markup, currency: "rub" }
    }
}

class Invoice {
    private status: InvoiceStatus = "draft"
    constructor(public readonly id: string, private readonly lines: Billable[]) {}
    public issue(): void {
        if (this.status !== "draft") throw new Error("Can only issue from draft")
        this.status = "issued"
    }
    public markPaid(): void {
        if (this.status !== "issued") throw new Error("Can pay only issued invoice")
        this.status = "paid"
    }
    public getStatus(): InvoiceStatus {
        return this.status
    }
    public getLines(): readonly Billable[] {
        return this.lines
    }
}

class InvoiceCalculator {
    public sum(lines: readonly Billable[]): Money {
        return lines.reduce<Money>(
            (acc, line) => ({ amount: acc.amount + line.total().amount, currency: "rub" }),
            { amount: 0, currency: "rub" }
        )
    }
}

type PaymentResult =
    | { ok: true; paidAt: string; method: string }
    | { ok: false; reason: "declined" | "network_error"; method: string }

interface PaymentMethod {
    methodName: string
    pay(invoice: Invoice, amount: Money): Promise<PaymentResult>
}

class CashPayment implements PaymentMethod {
    public readonly methodName: "cash" = "cash";
    async pay(invoice: Invoice, amount: Money): Promise<PaymentResult> {
        if (invoice.getStatus() !== "issued") return { ok: false, reason: "declined", method: this.methodName }
        return { ok: true, paidAt: new Date().toISOString(), method: this.methodName }
    }
}

async function demo(): Promise<Invoice> {
    const lines = [
        new LaborLine("Диагностика", 2, 1500),
        new LaborLine("Монтаж", 15, 4000),
        new PartLine("Тормозные колодки", 2, 3000, 20), 
        new PartLine("Масло моторное", 5, 800, 15),
    ]
    
    const calc = new InvoiceCalculator()
    console.log("Итого:", calc.sum(lines))
    
    const invoice = new Invoice("INV-2026-0001", lines)
    return invoice
}

async function demoSign(invoice: Promise<Invoice>) {
    const inv = await invoice
    inv.issue()
    console.log(inv)
}

const invoice = demo()
demoSign(invoice)