import { useState, useEffect, useRef } from "react";

const RED = "#cc3300";
const BLUE_FOCUS = "#3b82f6";
const BG = "#080d1a";
const CARD = "rgba(15,22,40,0.85)";
const BORDER = "#1e2a3a";
const INPUT_BG = "#0d1626";
const MUTED = "#6b7ea0";
const TEXT = "#e8edf5";
const GREEN = "#22c55e";

const SERVICOS = [
  { id: "arq", label: "Projeto Arquitetônico", desc: "Todo o desenvolvimento da ideia, detalhes, vistas 3D. Todas versões necessárias para conseguirmos chegar no resultado desejado." },
  { id: "hid", label: "Projeto Hidráulico", desc: "Cálculo, detalhamento e quantitativo de toda a parte hidráulica, considerando a fossa e filtro." },
  { id: "est", label: "Projeto Estrutural", desc: "Cálculo, detalhamento e quantitativo de toda a parte estrutural. Pensando sempre na otimização máxima da estrutura." },
  { id: "ele", label: "Projeto Elétrico", desc: "Cálculo, detalhamento e quantitativo de toda a parte elétrico. Considerando pontos de ar condicionado e de internet." },
  { id: "apr", label: "Aprovação com a prefeitura", desc: "Toda a aprovação do projeto, protocolos e todas as solicitações necessárias. Deixando somente a responsabilidade para o cliente de assinaturas e pagamento de taxas." },
  { id: "vis", label: "Visitas técnicas", desc: "Inclusos de 2 a 3 visitas para acompanhamento básico da construção. Para visitas adicionais, serão cobradas a parte tendo o custo de uma hora técnica (R$ 350,00)." },
];

const MOCK = [
  { id: 1, nome: "Carlos Eduardo Souza", cpfcnpj: "123.456.789-00", rua: "Rua das Flores", numero: "100", complemento: "", bairro: "Centro", cidade: "Ilhota", estado: "SC", cep: "88230-000", email: "carlos@email.com", telefone: "(47) 99999-1111", data: "12/04/2026" },
  { id: 2, nome: "Mariana Costa Ltda", cpfcnpj: "98.765.432/0001-10", rua: "Av. Central", numero: "500", complemento: "Sala 3", bairro: "Itoupava", cidade: "Blumenau", estado: "SC", cep: "89010-000", email: "mariana@empresa.com", telefone: "(47) 98888-2222", data: "14/04/2026" },
];

const formatDate = () => new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
const endFull = (c) => `${c.rua}, ${c.numero}${c.complemento ? ", " + c.complemento : ""} - ${c.bairro} - ${c.cidade}/${c.estado} - CEP: ${c.cep}`;

// Particles background
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const pts = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + 0.3, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, o: Math.random() * 0.5 + 0.2 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,200,255,${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

function StepBar({ total, atual }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1; const ativo = n === atual; const feito = n < atual;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, transition: "all 0.3s", background: feito ? GREEN : ativo ? RED : "transparent", border: `2px solid ${feito ? GREEN : ativo ? RED : "#2a3a52"}`, color: feito || ativo ? "#fff" : MUTED }}>
              {feito ? "✓" : n}
            </div>
            {i < total - 1 && <div style={{ flex: 1, height: 2, background: feito ? GREEN : "#1e2a3a", margin: "0 4px", transition: "background 0.4s" }} />}
          </div>
        );
      })}
    </div>
  );
}

const lStyle = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: MUTED, textTransform: "uppercase", marginBottom: 7 };
const iBase = { width: "100%", boxSizing: "border-box", background: INPUT_BG, border: "1.5px solid #1e2a3a", borderRadius: 8, padding: "13px 14px", fontSize: 14, color: TEXT, outline: "none", display: "block", transition: "border-color 0.2s", fontFamily: "inherit" };

function Field({ label, value, onChange, placeholder, error, type = "text", required = true, half = false }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 16, flex: half ? "1 1 45%" : "1 1 100%" }}>
      <span style={lStyle}>{label}{required && <span style={{ color: RED, marginLeft: 2 }}>*</span>}</span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ ...iBase, borderColor: error ? RED : focus ? BLUE_FOCUS : "#1e2a3a" }} />
      {error && <span style={{ color: RED, fontSize: 12, marginTop: 4, display: "block" }}>{error}</span>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, required = true }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 16, flex: "1 1 45%" }}>
      <span style={lStyle}>{label}{required && <span style={{ color: RED, marginLeft: 2 }}>*</span>}</span>
      <select value={value} onChange={onChange} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ ...iBase, borderColor: focus ? BLUE_FOCUS : "#1e2a3a", cursor: "pointer" }}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(v => ({ v, l: v }));

export default function App() {
  const [view, setView] = useState("welcome");
  const [etapa, setEtapa] = useState(1);
  const [cl, setCl] = useState({ nome: "", cpfcnpj: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "SC", cep: "", email: "", telefone: "" });
  const [pendentes, setPendentes] = useState(MOCK);
  const [sel, setSel] = useState(null);
  const [prop, setProp] = useState({ servicos: [], valorTotal: "", formaPagamento: "avista", valorDesconto: "500", pagamentoCustom: "", prazo1: "30", prazo2: "60 a 90", obs: "" });
  const [erros, setErros] = useState({});
  const [cepLoading, setCepLoading] = useState(false);

  const buscarCep = async (cep) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const d = await r.json();
      if (!d.erro) setCl(c => ({ ...c, rua: d.logradouro || c.rua, bairro: d.bairro || c.bairro, cidade: d.localidade || c.cidade, estado: d.uf || c.estado }));
    } catch (_) {}
    setCepLoading(false);
  };

  const upd = (k) => (e) => setCl(c => ({ ...c, [k]: e.target.value }));

  const validar = () => {
    const e = {};
    if (etapa === 1) { if (!cl.nome.trim()) e.nome = "Campo obrigatório"; if (!cl.cpfcnpj.trim()) e.cpfcnpj = "Campo obrigatório"; }
    if (etapa === 2) { if (!cl.cep.trim()) e.cep = "Campo obrigatório"; if (!cl.rua.trim()) e.rua = "Campo obrigatório"; if (!cl.numero.trim()) e.numero = "Campo obrigatório"; if (!cl.bairro.trim()) e.bairro = "Campo obrigatório"; if (!cl.cidade.trim()) e.cidade = "Campo obrigatório"; }
    if (etapa === 3) { if (!cl.email.trim()) e.email = "Campo obrigatório"; if (!cl.telefone.trim()) e.telefone = "Campo obrigatório"; }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const validarProp = () => {
    const e = {};
    if (prop.servicos.length === 0) e.servicos = "Selecione ao menos um serviço";
    if (!prop.valorTotal.trim()) e.valorTotal = "Campo obrigatório";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const avancar = () => {
    if (!validar()) return;
    if (etapa < 3) { setEtapa(e => e + 1); return; }
    setPendentes(p => [...p, { id: Date.now(), ...cl, data: new Date().toLocaleDateString("pt-BR") }]);
    setView("sucesso");
  };

  const toggleSv = (id) => setProp(p => ({ ...p, servicos: p.servicos.includes(id) ? p.servicos.filter(x => x !== id) : [...p.servicos, id] }));
  const valorNum = parseFloat(prop.valorTotal.replace(/\./g, "").replace(",", ".")) || 0;
  const descNum = parseFloat(prop.valorDesconto.replace(/\./g, "").replace(",", ".")) || 0;
  const valorDesc = valorNum - descNum;
  const svSel = SERVICOS.filter(s => prop.servicos.includes(s.id));

  const outerStyle = { fontFamily: "'Inter', system-ui, sans-serif", background: BG, minHeight: "100vh", color: TEXT, position: "relative", overflowX: "hidden" };
  const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 36px", position: "relative", zIndex: 1, backdropFilter: "blur(12px)" };
  const btnPrim = { background: RED, border: "none", borderRadius: 8, padding: "13px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 };
  const btnSec = { background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "11px 18px", color: MUTED, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 };
  const panelCard = { background: "rgba(13,22,42,0.7)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px", marginBottom: 12 };

  const gerarPDF = () => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Contrato - ${sel.nome}</title>
    <style>body{font-family:Garamond,Georgia,serif;margin:40px;color:#1a1a1a;font-size:15px;line-height:1.9}.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #cc3300;padding-bottom:12px;margin-bottom:24px}.box{border:1.5px solid #cc3300;border-radius:6px;padding:12px 16px;margin-bottom:14px}h2{font-size:15px;font-weight:bold;margin:20px 0 8px}h3{font-size:13px;font-weight:bold;margin:12px 0 4px}ul{margin:4px 0 10px 20px}li{margin-bottom:5px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:10px}.assin{display:flex;gap:60px;margin-top:56px}.ass{flex:1;border-top:1px solid #333;padding-top:10px;font-size:12px;color:#666}@media print{body{margin:20px}}</style>
    </head><body>
    <div class="hdr"><div><b style="font-size:22px">CONTRATO</b><br><span style="font-size:16px;font-weight:bold">Prestação de Serviços</span></div><div style="text-align:right;font-size:13px;color:#666">Ilhota, ${formatDate()}</div></div>
    <div class="box"><b>Contratante</b><br><span style="color:#666">Nome: </span>${sel.nome}<br><span style="color:#666">CPF/CNPJ: </span>${sel.cpfcnpj}<br><span style="color:#666">Endereço: </span>${endFull(sel)}<br><span style="color:#666">E-mail: </span>${sel.email}${sel.telefone ? `<br><span style="color:#666">Telefone: </span>${sel.telefone}` : ""}</div>
    <div class="box"><b>Contratado</b><br><span style="color:#666">Nome: </span>DOUGLAS BORBA ENGENHARIA E CONSULTORIA LTDA<br><span style="color:#666">CPF/CNPJ: </span>49.501.260/0001-30<br><span style="color:#666">Endereço: </span>Rua Guilherme Brockweld, 245 - Ilhotinha - Ilhota/SC<br><span style="color:#666">E-mail: </span>eng.douglasborba@gmail.com</div>
    <h2>1. Objeto do contrato</h2><p>O presente contrato tem como objetivo descrever a negociação realizada no orçamento das solicitações da contratante. Conforme abaixo:</p>
    ${svSel.map((sv, i) => `<h3>1.${i+1}. ${sv.label}</h3><p style="margin:0 0 8px 16px">${sv.desc}</p>`).join("")}
    ${prop.obs ? `<p><b>Observações adicionais:</b> ${prop.obs}</p>` : ""}
    <h2>2. Valor e forma de pagamento</h2>
    <p><b>2.1.</b> O valor pago do serviço total será de <b>R$ ${prop.valorTotal}</b>, que serão pagos da seguinte maneira:</p>
    ${prop.formaPagamento === "avista" ? `<ul><li>À vista com desconto de R$ ${prop.valorDesconto} no ato da assinatura desse contrato (R$ ${valorDesc.toLocaleString("pt-BR",{minimumFractionDigits:2})}).</li></ul>` : `<ul><li>${prop.pagamentoCustom}</li></ul>`}
    <p><b>2.2.</b> O pagamento deverá ser realizado no pix abaixo:<br>&nbsp;&nbsp;&nbsp;CNPJ: 49501260000130<br>&nbsp;&nbsp;&nbsp;DOUGLAS BORBA ENGENHARIA LTDA<br>&nbsp;&nbsp;&nbsp;SICOOB</p>
    <p><b>2.3.</b> Nesse valor <b>não estão inclusos</b> os valores de taxas de prefeitura e ART.</p>
    <p><b>2.4.</b> Nesse valor <b>estão inclusos</b> custos de impressões e placa da obra.</p>
    <p><b>2.5.</b> Após a aprovação das plantas entregues, as eventuais alterações que forem solicitadas serão cobradas como aditivo seguindo os critérios abaixo:</p>
    <ul><li>Alterações que envolver até 30% do escopo de cada projeto será cobrado o valor de 50% do valor referente a tal projeto.</li><li>Alterações que envolver 50% ou mais do escopo de cada projeto será cobrado o valor integral de tal projeto.</li></ul>
    <p style="font-style:italic;font-size:13px">Observações: Entende-se por alterações a serem cobradas como aditivo aquelas que ocorrem após a elaboração dos projetos e a entrega dos mesmos. Alterações realizadas na fase de anteprojeto não são consideradas como aditivo.</p>
    <h2>3. Prazos</h2>
    <p><b>3.1.</b> O prazo para a entrega dos projetos será:</p>
    <ul><li>Primeiro Layout: ${prop.prazo1} dias.</li><li>Os projetos dependem exclusivamente da aprovação do anteprojeto (primeira fase do desenvolvimento) por parte da contratada.</li></ul>
    <p>Após aprovação do layout do projeto:</p>
    <ul><li>Projeto completo: ${prop.prazo2} dias.</li><li>O projeto completo também contempla o Alvará de Construção, que depende exclusivamente da demanda e prazos da prefeitura, mas em média leva 30 dias a partir do protocolo.</li></ul>
    <h2>4. Vigência e Rescisão</h2>
    <p><b>4.1.</b> O presente Contrato inicia na data de sua assinatura e termina na finalização da prestação de serviço.</p>
    <p><b>4.2.</b> Este Contrato não estabelece vínculo empregatício ou de representação entre as Partes, de forma que cada uma será responsável por suas próprias obrigações (tributárias, previdenciárias e trabalhistas) e não poderão representar a outra em qualquer negócio jurídico.</p>
    <h2>5. Obrigações das partes</h2>
    <div class="grid2">
      <div class="box"><b>Contratante</b><ul><li>Efetuar o pagamento no prazo e conforme combinado;</li><li>Oferecer as informações necessárias para que o Contratado possa executar os serviços previstos neste Contrato;</li><li>Efetuar os pagamentos dos custos com documentações junto aos órgãos reguladores e fiscalizadores, inclusive taxas e multas;</li><li>Não reproduzir ou repetir os projetos em apreço sem a prévia autorização;</li><li>Em caso de necessidade de cópias de projeto, o custo será da contratante.</li></ul></div>
      <div class="box"><b>Contratado</b><ul><li>Executar os serviços previstos neste Contrato;</li><li>Manter a confidencialidade das informações fornecidas pela Contratante;</li><li>Fornecer esclarecimentos à contratante com relação aos projetos entregues;</li><li>Entregar todos os projetos de forma digital;</li><li>Providenciar a placa da obra;</li><li>Cumprir os prazos estipulados;</li><li>Calcular os projetos em apreço conforme as Normas Técnicas Brasileiras.</li></ul></div>
    </div>
    <h2>6. Desistência</h2>
    <p><b>6.1.</b> Em caso de desistência do contratante no meio do desenvolvimento não dá direito a nenhum ressarcimento de valores já pagos.</p>
    <div class="assin"><div class="ass">Assinatura Contratante<br><b style="color:#333">${sel.nome}</b></div><div class="ass">Assinatura Contratado<br><b style="color:#333">Douglas Borba — DOUGLAS BORBA ENGENHARIA E CONSULTORIA LTDA</b></div></div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  // WELCOME
  if (view === "welcome") return (
    <div style={{ ...outerStyle, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <Particles />
      <div style={{ ...cardStyle, maxWidth: 560, width: "90%", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(204,51,0,0.12)", border: "1px solid rgba(204,51,0,0.3)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: RED, textTransform: "uppercase", marginBottom: 28 }}>
          ● Seja bem-vindo
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 3, color: RED, textTransform: "uppercase", marginBottom: 12 }}>DB Engenharia</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2, color: "#fff" }}>
          Sua obra começa<br />com a gente.
        </h1>
        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
          Estamos felizes em formalizar nossa parceria. Preencha seus dados para gerarmos seu contrato. É rápido e leva menos de 3 minutos.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 36 }}>
          {[["🔒", "100% Seguro"], ["⏱", "3 minutos"], ["⚡", "Ágil e simples"]].map(([icon, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(204,51,0,0.12)", border: "1px solid rgba(204,51,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
              <span style={{ fontSize: 12, color: MUTED }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => { setView("cliente"); setEtapa(1); setCl({ nome: "", cpfcnpj: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "SC", cep: "", email: "", telefone: "" }); setErros({}); }} style={{ ...btnPrim, justifyContent: "center", padding: "15px 32px", fontSize: 15, borderRadius: 10 }}>
            Vamos começar →
          </button>
          <button onClick={() => setView("painel")} style={{ ...btnSec, justifyContent: "center", padding: "13px 32px", fontSize: 14, borderRadius: 10, color: MUTED }}>
            ⚙️ Acessar painel interno
            <span style={{ background: RED, borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "2px 8px", color: "#fff", marginLeft: 4 }}>{pendentes.length}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // FORMULÁRIO CLIENTE
  if (view === "cliente") {
    const etapasConfig = [
      {
        titulo: "Dados pessoais", sub: "Informe seu nome completo e documento", icon: "👤",
        campos: (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
            <Field label="Nome completo / Razão social" value={cl.nome} onChange={upd("nome")} placeholder="Ex: João da Silva" error={erros.nome} />
            <Field label="CPF / CNPJ" value={cl.cpfcnpj} onChange={upd("cpfcnpj")} placeholder="000.000.000-00 ou 00.000.000/0001-00" error={erros.cpfcnpj} />
          </div>
        )
      },
      {
        titulo: "Endereço", sub: "Digite o CEP e completamos o restante para você", icon: "📍",
        campos: (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
            <div style={{ marginBottom: 16, flex: "0 0 160px" }}>
              <span style={lStyle}>CEP <span style={{ color: RED }}>*</span></span>
              <input value={cl.cep} onChange={e => { upd("cep")(e); buscarCep(e.target.value); }} placeholder="00000-000"
                style={{ ...iBase, borderColor: erros.cep ? RED : "#1e2a3a" }} />
              {cepLoading && <span style={{ fontSize: 12, color: MUTED, marginTop: 4, display: "block" }}>Buscando...</span>}
              {erros.cep && <span style={{ color: RED, fontSize: 12, marginTop: 4, display: "block" }}>{erros.cep}</span>}
            </div>
            <Field label="Rua / Avenida" value={cl.rua} onChange={upd("rua")} placeholder="Ex: Rua das Flores" error={erros.rua} />
            <div style={{ marginBottom: 16, flex: "0 0 100px" }}>
              <span style={lStyle}>Número <span style={{ color: RED }}>*</span></span>
              <input value={cl.numero} onChange={upd("numero")} placeholder="245" style={{ ...iBase, borderColor: erros.numero ? RED : "#1e2a3a" }} />
              {erros.numero && <span style={{ color: RED, fontSize: 12, marginTop: 4, display: "block" }}>{erros.numero}</span>}
            </div>
            <div style={{ marginBottom: 16, flex: "1 1 140px" }}>
              <span style={lStyle}>Complemento</span>
              <input value={cl.complemento} onChange={upd("complemento")} placeholder="Sala, bloco..." style={iBase} />
            </div>
            <Field label="Bairro" value={cl.bairro} onChange={upd("bairro")} placeholder="Ex: Centro" error={erros.bairro} half />
            <Field label="Cidade" value={cl.cidade} onChange={upd("cidade")} placeholder="Ex: Ilhota" error={erros.cidade} half />
            <SelectField label="Estado" value={cl.estado} onChange={upd("estado")} options={ESTADOS} />
          </div>
        )
      },
      {
        titulo: "Contato", sub: "Últimos dados para finalizar seu cadastro", icon: "✉️",
        campos: (
          <>
            <div style={{ background: "rgba(204,51,0,0.07)", border: "1px solid rgba(204,51,0,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Próximo passo</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>Após o envio, nossa equipe entrará em contato para finalizar o contrato e alinhar os detalhes do projeto.</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
              <Field label="E-mail" type="email" value={cl.email} onChange={upd("email")} placeholder="seu@email.com" error={erros.email} />
              <Field label="Telefone / WhatsApp" value={cl.telefone} onChange={upd("telefone")} placeholder="(47) 9 0000-0000" error={erros.telefone} />
            </div>
          </>
        )
      }
    ];
    const et = etapasConfig[etapa - 1];
    return (
      <div style={{ ...outerStyle, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1.5rem" }}>
        <Particles />
        <div style={{ ...cardStyle, maxWidth: 560, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: RED, textTransform: "uppercase" }}>DB Engenharia</div>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>Etapa {etapa} de 3</div>
          </div>
          <StepBar total={3} atual={etapa} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(204,51,0,0.12)", border: "1px solid rgba(204,51,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{et.icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{et.titulo}</div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{et.sub}</div>
            </div>
          </div>
          {et.campos}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${BORDER}`, paddingTop: 20, marginTop: 8 }}>
            <button onClick={() => etapa > 1 ? setEtapa(e => e - 1) : setView("welcome")} style={btnSec}>← Voltar</button>
            <button onClick={avancar} style={btnPrim}>{etapa < 3 ? "Continuar →" : "Enviar dados ✓"}</button>
          </div>
        </div>
      </div>
    );
  }

  // SUCESSO
  if (view === "sucesso") return (
    <div style={{ ...outerStyle, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <Particles />
      <div style={{ ...cardStyle, maxWidth: 440, width: "90%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: `2px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px", color: GREEN, fontWeight: 700 }}>✓</div>
        <h2 style={{ margin: "0 0 10px", fontSize: 22, color: "#fff" }}>Dados enviados!</h2>
        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7 }}>Recebemos suas informações. Nossa equipe entrará em contato em breve para finalizar o contrato.</p>
      </div>
    </div>
  );

  // PAINEL
  if (view === "painel") return (
    <div style={{ ...outerStyle, padding: "2rem" }}>
      <Particles />
      <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={() => setView("welcome")} style={btnSec}>← Início</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}>Contratos pendentes</h2>
          <span style={{ background: RED, borderRadius: 20, fontSize: 12, fontWeight: 700, padding: "3px 10px", color: "#fff" }}>{pendentes.length}</span>
        </div>
        {pendentes.length === 0 && <div style={{ color: MUTED, textAlign: "center", padding: "3rem 0" }}>Nenhum contrato pendente</div>}
        <div style={{ display: "grid", gap: 12 }}>
          {pendentes.map(p => (
            <div key={p.id} style={panelCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "#fff" }}>{p.nome}</div>
                  <div style={{ fontSize: 13, color: MUTED }}>{p.cpfcnpj} · {p.email}</div>
                  <div style={{ fontSize: 12, color: "#3a4a60", marginTop: 4 }}>Recebido em {p.data}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ background: "rgba(204,51,0,0.1)", border: "1px solid rgba(204,51,0,0.3)", color: "#ff6633", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "4px 12px" }}>Pendente</span>
                  <button onClick={() => { setSel(p); setProp({ servicos: [], valorTotal: "", formaPagamento: "avista", valorDesconto: "500", pagamentoCustom: "", prazo1: "30", prazo2: "60 a 90", obs: "" }); setErros({}); setView("proposta"); }} style={btnPrim}>Gerar contrato</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // PROPOSTA
  if (view === "proposta") return (
    <div style={{ ...outerStyle, padding: "2rem" }}>
      <Particles />
      <div style={{ maxWidth: 660, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <button onClick={() => setView("painel")} style={{ ...btnSec, marginBottom: 20 }}>← Painel</button>
        <div style={{ ...panelCard, display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(204,51,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: RED, flexShrink: 0 }}>{sel?.nome?.[0]}</div>
          <div><div style={{ fontWeight: 700, color: "#fff" }}>{sel?.nome}</div><div style={{ fontSize: 13, color: MUTED }}>{sel?.email} · {sel?.cpfcnpj}</div></div>
        </div>
        <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#fff" }}>Detalhes da proposta</h2>

        <div style={{ ...panelCard, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: "#fff" }}>Serviços contratados</div>
          {erros.servicos && <div style={{ color: RED, fontSize: 12, marginBottom: 10 }}>{erros.servicos}</div>}
          <div style={{ display: "grid", gap: 8 }}>
            {SERVICOS.map(sv => {
              const on = prop.servicos.includes(sv.id);
              return (
                <label key={sv.id} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", padding: "11px 14px", borderRadius: 8, border: `1px solid ${on ? RED : BORDER}`, background: on ? "rgba(204,51,0,0.08)" : "transparent", transition: "all 0.2s" }}>
                  <input type="checkbox" checked={on} onChange={() => toggleSv(sv.id)} style={{ accentColor: RED, width: 16, height: 16 }} />
                  <span style={{ fontSize: 14, fontWeight: on ? 700 : 400, color: on ? "#fff" : TEXT }}>{sv.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ ...panelCard, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: "#fff" }}>Valor e pagamento</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
            <div style={{ marginBottom: 16, flex: "1 1 200px" }}>
              <span style={lStyle}>Valor total <span style={{ color: RED }}>*</span></span>
              <input value={prop.valorTotal} onChange={e => setProp(p => ({ ...p, valorTotal: e.target.value }))} placeholder="Ex: 4.000,00" style={{ ...iBase, borderColor: erros.valorTotal ? RED : BORDER }} />
              {erros.valorTotal && <span style={{ color: RED, fontSize: 12, marginTop: 4, display: "block" }}>{erros.valorTotal}</span>}
            </div>
            <div style={{ marginBottom: 16, flex: "1 1 160px" }}>
              <span style={lStyle}>Forma de pagamento</span>
              <select value={prop.formaPagamento} onChange={e => setProp(p => ({ ...p, formaPagamento: e.target.value }))} style={iBase}>
                <option value="avista">À vista com desconto</option>
                <option value="parcelado">Parcelado</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>
          {prop.formaPagamento === "avista" && (
            <div style={{ marginBottom: 16 }}>
              <span style={lStyle}>Valor do desconto (R$)</span>
              <input value={prop.valorDesconto} onChange={e => setProp(p => ({ ...p, valorDesconto: e.target.value }))} placeholder="500,00" style={iBase} />
              {valorNum > 0 && <span style={{ fontSize: 13, color: MUTED, marginTop: 6, display: "block" }}>Valor com desconto: <strong style={{ color: "#fff" }}>R$ {valorDesc.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>}
            </div>
          )}
          {prop.formaPagamento !== "avista" && (
            <div style={{ marginBottom: 16 }}>
              <span style={lStyle}>Descrição do pagamento</span>
              <textarea value={prop.pagamentoCustom} onChange={e => setProp(p => ({ ...p, pagamentoCustom: e.target.value }))} placeholder="Descreva a forma de pagamento..." style={{ ...iBase, minHeight: 70, resize: "vertical" }} />
            </div>
          )}
        </div>

        <div style={{ ...panelCard, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: "#fff" }}>Prazos</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <span style={lStyle}>Primeiro layout (dias)</span>
              <input value={prop.prazo1} onChange={e => setProp(p => ({ ...p, prazo1: e.target.value }))} placeholder="30" style={iBase} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={lStyle}>Projeto completo (dias)</span>
              <input value={prop.prazo2} onChange={e => setProp(p => ({ ...p, prazo2: e.target.value }))} placeholder="60 a 90" style={iBase} />
            </div>
          </div>
        </div>

        <div style={{ ...panelCard, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: "#fff" }}>Observações adicionais</div>
          <textarea value={prop.obs} onChange={e => setProp(p => ({ ...p, obs: e.target.value }))} placeholder="Cláusulas específicas, condições especiais desta proposta..." style={{ ...iBase, minHeight: 80, resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => { if (validarProp()) setView("contrato"); }} style={{ ...btnPrim, padding: "14px 36px", fontSize: 15, borderRadius: 10 }}>Gerar contrato →</button>
        </div>
      </div>
    </div>
  );

  // CONTRATO
  if (view === "contrato") return (
    <div style={{ ...outerStyle, padding: "2rem" }}>
      <Particles />
      <div style={{ maxWidth: 740, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setView("proposta")} style={btnSec}>← Editar proposta</button>
          <button onClick={gerarPDF} style={btnPrim}>⬇ Baixar / Imprimir PDF</button>
        </div>
        <div style={{ background: "#fff", color: "#1a1a1a", borderRadius: 12, padding: "40px 44px", fontFamily: "Garamond, Georgia, serif", fontSize: 15, lineHeight: 1.9 }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #cc3300", paddingBottom: 14, marginBottom: 24 }}>
            <div><div style={{ fontSize: 24, fontWeight: "bold" }}>CONTRATO</div><div style={{ fontSize: 17, fontWeight: "bold" }}>Prestação de Serviços</div></div>
            <div style={{ fontSize: 13, color: "#666", alignSelf: "flex-end" }}>Ilhota, {formatDate()}</div>
          </div>
          {[{ title: "Contratante", rows: [["Nome", sel.nome], ["CPF/CNPJ", sel.cpfcnpj], ["Endereço", endFull(sel)], ["E-mail", sel.email], sel.telefone ? ["Telefone", sel.telefone] : null].filter(Boolean) }, { title: "Contratado", rows: [["Nome", "DOUGLAS BORBA ENGENHARIA E CONSULTORIA LTDA"], ["CPF/CNPJ", "49.501.260/0001-30"], ["Endereço", "Rua Guilherme Brockweld, 245 - Ilhotinha - Ilhota/SC"], ["E-mail", "eng.douglasborba@gmail.com"]] }].map(box => (
            <div key={box.title} style={{ border: "1.5px solid #cc3300", borderRadius: 6, padding: "14px 18px", marginBottom: 16 }}>
              <div style={{ fontWeight: "bold", marginBottom: 10 }}>{box.title}</div>
              {box.rows.map(([lb, val]) => <div key={lb}><span style={{ color: "#666" }}>{lb}: </span>{val}</div>)}
            </div>
          ))}
          <div style={{ fontWeight: "bold", fontSize: 16, margin: "20px 0 8px" }}>1. Objeto do contrato</div>
          <p style={{ margin: "0 0 12px" }}>O presente contrato tem como objetivo descrever a negociação realizada no orçamento das solicitações da contratante. Conforme abaixo:</p>
          {svSel.map((sv, i) => <div key={sv.id} style={{ marginBottom: 12 }}><div style={{ fontWeight: "bold" }}>1.{i + 1}. {sv.label}</div><div style={{ marginLeft: 18 }}>{sv.desc}</div></div>)}
          {prop.obs && <p><strong>Observações adicionais:</strong> {prop.obs}</p>}
          <div style={{ fontWeight: "bold", fontSize: 16, margin: "20px 0 8px" }}>2. Valor e forma de pagamento</div>
          <p><strong>2.1.</strong> O valor pago do serviço total será de <strong>R$ {prop.valorTotal}</strong>, que serão pagos da seguinte maneira:</p>
          {prop.formaPagamento === "avista" && <ul style={{ margin: "4px 0 10px 20px" }}><li>À vista com desconto de R$ {prop.valorDesconto} no ato da assinatura desse contrato (R$ {valorDesc.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}).</li></ul>}
          {prop.formaPagamento !== "avista" && prop.pagamentoCustom && <ul style={{ margin: "4px 0 10px 20px" }}><li>{prop.pagamentoCustom}</li></ul>}
          <p><strong>2.2.</strong> O pagamento deverá ser realizado no pix abaixo:</p>
          <div style={{ marginLeft: 18, marginBottom: 10 }}>CNPJ: 49501260000130<br />DOUGLAS BORBA ENGENHARIA LTDA<br />SICOOB</div>
          <p><strong>2.3.</strong> Nesse valor <strong>não estão inclusos</strong> os valores de taxas de prefeitura e ART.</p>
          <p><strong>2.4.</strong> Nesse valor <strong>estão inclusos</strong> custos de impressões e placa da obra.</p>
          <p><strong>2.5.</strong> Após a aprovação das plantas entregues, as eventuais alterações que forem solicitadas serão cobradas como aditivo seguindo os critérios abaixo:</p>
          <ul style={{ margin: "4px 0 10px 20px" }}><li>Alterações que envolver até 30% do escopo de cada projeto será cobrado o valor de 50% do valor referente a tal projeto.</li><li>Alterações que envolver 50% ou mais do escopo de cada projeto será cobrado o valor integral de tal projeto.</li></ul>
          <p style={{ fontStyle: "italic", fontSize: 13 }}>Observações: Entende-se por alterações a serem cobradas como aditivo aquelas que ocorrem após a elaboração dos projetos e a entrega dos mesmos. Alterações realizadas na fase de anteprojeto não são consideradas como aditivo.</p>
          <div style={{ fontWeight: "bold", fontSize: 16, margin: "20px 0 8px" }}>3. Prazos</div>
          <p><strong>3.1.</strong> O prazo para a entrega dos projetos será:</p>
          <ul style={{ margin: "4px 0 8px 20px" }}><li>Primeiro Layout: {prop.prazo1} dias.</li><li>Os projetos dependem exclusivamente da aprovação do anteprojeto (primeira fase do desenvolvimento) por parte da contratada.</li></ul>
          <p>Após aprovação do layout do projeto:</p>
          <ul style={{ margin: "4px 0 10px 20px" }}><li>Projeto completo: {prop.prazo2} dias.</li><li>O projeto completo também contempla o Alvará de Construção, que depende exclusivamente da demanda e prazos da prefeitura, mas em média leva 30 dias a partir do protocolo.</li></ul>
          <div style={{ fontWeight: "bold", fontSize: 16, margin: "20px 0 8px" }}>4. Vigência e Rescisão</div>
          <p><strong>4.1.</strong> O presente Contrato inicia na data de sua assinatura e termina na finalização da prestação de serviço.</p>
          <p><strong>4.2.</strong> Este Contrato não estabelece vínculo empregatício ou de representação entre as Partes, de forma que cada uma será responsável por suas próprias obrigações (tributárias, previdenciárias e trabalhistas) e não poderão representar a outra em qualquer negócio jurídico.</p>
          <div style={{ fontWeight: "bold", fontSize: 16, margin: "20px 0 8px" }}>5. Obrigações das partes</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
            {[{ t: "Contratante", its: ["Efetuar o pagamento no prazo e conforme combinado;", "Oferecer as informações necessárias para que o Contratado possa executar os serviços previstos neste Contrato;", "Efetuar os pagamentos dos custos com documentações junto aos órgãos reguladores e fiscalizadores, inclusive taxas e multas;", "Não reproduzir ou repetir os projetos em apreço sem a prévia autorização;", "Em caso de necessidade de cópias de projeto, o custo será da contratante."] }, { t: "Contratado", its: ["Executar os serviços previstos neste Contrato;", "Manter a confidencialidade das informações fornecidas pela Contratante;", "Fornecer esclarecimentos à contratante com relação aos projetos entregues;", "Entregar todos os projetos de forma digital;", "Providenciar a placa da obra;", "Cumprir os prazos estipulados;", "Calcular os projetos em apreço conforme as Normas Técnicas Brasileiras."] }].map(b => (
              <div key={b.t} style={{ border: "1.5px solid #cc3300", borderRadius: 6, padding: "12px 16px" }}>
                <div style={{ fontWeight: "bold", marginBottom: 10 }}>{b.t}</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>{b.its.map(it => <li key={it} style={{ marginBottom: 5 }}>{it}</li>)}</ul>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: "bold", fontSize: 16, margin: "20px 0 8px" }}>6. Desistência</div>
          <p><strong>6.1.</strong> Em caso de desistência do contratante no meio do desenvolvimento não dá direito a nenhum ressarcimento de valores já pagos.</p>
          <div style={{ display: "flex", gap: 60, marginTop: 56 }}>
            <div style={{ flex: 1, borderTop: "1px solid #333", paddingTop: 10, fontSize: 12, color: "#666" }}>Assinatura Contratante<br /><strong style={{ color: "#333" }}>{sel.nome}</strong></div>
            <div style={{ flex: 1, borderTop: "1px solid #333", paddingTop: 10, fontSize: 12, color: "#666" }}>Assinatura Contratado<br /><strong style={{ color: "#333" }}>Douglas Borba — DOUGLAS BORBA ENGENHARIA E CONSULTORIA LTDA</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
