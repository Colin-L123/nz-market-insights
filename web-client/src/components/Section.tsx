import './Section.css'
export default function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="section-wrapper">
            <h2 className="section-title">{title}</h2>
            {children}
        </section>
    )
}
