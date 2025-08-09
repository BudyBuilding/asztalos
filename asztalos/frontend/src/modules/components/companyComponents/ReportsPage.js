// src/pages/ReportsPage.js
import React, { useMemo, useEffect, useState } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Table,
  ProgressBar,
  Badge,
  Button,
  Form,
  Modal,
  InputGroup
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import reportApi from "../../../data/api/reportApi";
import downloadBlob from "../../../data/downloadBlob";

// ==== Mock: elérhető formátumok (később backendről) ====
const AVAILABLE_FORMATS = ["CSV", "XLSX", "PDF"];

// ==== Paraméter típusok: dateRange, enum, text, number, checkbox ====
const PARAM_TYPES = [
  { value: "dateRange", label: "Dátum intervallum" },
  { value: "enum", label: "Választó (enum)" },
  { value: "text", label: "Szöveg" },
  { value: "number", label: "Szám" },
  { value: "checkbox", label: "Jelölőnégyzet" }
];

// ==== Mock report template-ek (később API-ból) ====
// param schema példa:
//  { key:"fromTo", type:"dateRange", label:"Időszak" }
//  { key:"user", type:"enum", label:"Felhasználó", options:[{label,id}] }
const INITIAL_TEMPLATES = [
  {
    id: "rep-works-monthly",
    name: "Havi munkaszám",
    description: "Munkák száma havi bontásban és összes táblák.",
    parameters: [
      { key: "period", type: "dateRange", label: "Időszak" },
      {
        key: "status",
        type: "enum",
        label: "Státusz",
        options: [
          { id: "any", label: "Mind" },
          { id: "open", label: "Nyitott" },
          { id: "done", label: "Kész" }
        ],
        default: "any"
      }
    ],
    formats: ["CSV", "XLSX", "PDF"]
  },
  {
    id: "rep-boards-by-color",
    name: "Táblák színenként",
    description: "Anyagfelhasználás összesítve színenként.",
    parameters: [
      { key: "period", type: "dateRange", label: "Időszak" },
      { key: "minBoards", type: "number", label: "Minimum tábla", default: 0 }
    ],
    formats: ["CSV", "XLSX"]
  }
];

// ====== Segéd: generált paraméter űrlap egy template-hez ======
function ParametersForm({ template, value, onChange }) {
  const setField = (key, v) => onChange({ ...value, [key]: v });

  return (
    <div className="d-grid gap-2">
      {template.parameters?.map((p) => {
        const v = value?.[p.key];

        if (p.type === "dateRange") {
          const from = v?.from || "";
          const to = v?.to || "";
          return (
            <Row key={p.key}>
              <Col>
                <Form.Label>{p.label} – Kezdő</Form.Label>
                <Form.Control
                  type="date"
                  value={from}
                  onChange={(e) =>
                    setField(p.key, { ...v, from: e.target.value })
                  }
                />
              </Col>
              <Col>
                <Form.Label>{p.label} – Vég</Form.Label>
                <Form.Control
                  type="date"
                  value={to}
                  onChange={(e) =>
                    setField(p.key, { ...v, to: e.target.value })
                  }
                />
              </Col>
            </Row>
          );
        }

        if (p.type === "enum") {
          return (
            <div key={p.key}>
              <Form.Label>{p.label}</Form.Label>
              <Form.Select
                value={v ?? p.default ?? ""}
                onChange={(e) => setField(p.key, e.target.value)}
              >
                {(p.options || []).map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          );
        }

        if (p.type === "text") {
          return (
            <div key={p.key}>
              <Form.Label>{p.label}</Form.Label>
              <Form.Control
                type="text"
                value={v ?? p.default ?? ""}
                onChange={(e) => setField(p.key, e.target.value)}
              />
            </div>
          );
        }

        if (p.type === "number") {
          return (
            <div key={p.key}>
              <Form.Label>{p.label}</Form.Label>
              <Form.Control
                type="number"
                value={v ?? p.default ?? 0}
                onChange={(e) =>
                  setField(
                    p.key,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>
          );
        }

        if (p.type === "checkbox") {
          return (
            <Form.Check
              key={p.key}
              type="checkbox"
              label={p.label}
              checked={!!v}
              onChange={(e) => setField(p.key, e.target.checked)}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

// ====== Export panel (user nézet) ======
function ReportExportPanel({ templates = [], onExport }) {
  const [selectedId, setSelectedId] = useState("");
  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId),
    [selectedId, templates]
  );
  const [params, setParams] = useState({});
  const [format, setFormat] = useState("CSV");

  // amikor megjönnek a template-ek, állíts be defaultot
  useEffect(() => {
    if (!templates.length) return;
    const first = templates[0];
    setSelectedId((prev) => (prev ? prev : first.id));
  }, [templates]);

  // ha váltasz reportot, reset paramok/format
  useEffect(() => {
    if (!selected) return;
    setParams(
      (selected.parameters || []).reduce((acc, p) => {
        if (p.type === "dateRange") acc[p.key] = { from: "", to: "" };
        else if (p.default != null) acc[p.key] = p.default;
        else acc[p.key] = p.type === "checkbox" ? false : "";
        return acc;
      }, {})
    );
    setFormat(selected.formats?.[0] || "CSV");
  }, [selectedId, selected]);

  const handleExportClick = () => {
    if (!selected || !format) return;
    onExport?.(selected.id, format, params);
  };

  if (!templates.length) {
    return (
      <Card className="shadow-sm">
        <Card.Body>Nem található report sablon.</Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">
          <i className="bi bi-download me-2" />
          Report export
        </Card.Title>

        <Row className="g-3">
          <Col lg={4}>
            <Form.Label>Report</Form.Label>
            <Form.Select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Form.Select>
            <div className="text-muted mt-2" style={{ fontSize: ".9rem" }}>
              {selected.description}
            </div>
          </Col>

          <Col lg={5}>
            <ParametersForm
              template={selected}
              value={params}
              onChange={setParams}
            />
          </Col>

          <Col lg={3}>
            <Form.Label>Formátum</Form.Label>
            <Form.Select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {(selected.formats || []).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Form.Select>
            <Button className="mt-3 w-100" onClick={handleExportClick}>
              <i className="bi bi-file-earmark-arrow-down me-2" />
              Exportálás
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

// ====== Admin: Report designer ======
function AdminReportDesigner({
  templates,
  onCreate,
  onUpdate,
  onDelete,
  availableFormats = AVAILABLE_FORMATS
}) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const blankTemplate = {
    id: "",
    name: "",
    description: "",
    parameters: [],
    formats: []
  };

  const [draft, setDraft] = useState(blankTemplate);

  const openCreate = () => {
    setEditing(null);
    setDraft(blankTemplate);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t.id);
    setDraft(JSON.parse(JSON.stringify(t)));
    setShowModal(true);
  };

  // param szerkesztő
  const addParam = () => {
    setDraft((d) => ({
      ...d,
      parameters: [
        ...(d.parameters || []),
        { key: "", type: "text", label: "" }
      ]
    }));
  };
  const updateParam = (i, patch) => {
    setDraft((d) => {
      const arr = [...(d.parameters || [])];
      arr[i] = { ...arr[i], ...patch };
      return { ...d, parameters: arr };
    });
  };
  const removeParam = (i) => {
    setDraft((d) => {
      const arr = [...(d.parameters || [])];
      arr.splice(i, 1);
      return { ...d, parameters: arr };
    });
  };

  const toggleFormat = (fmt) => {
    setDraft((d) => {
      const set = new Set(d.formats || []);
      if (set.has(fmt)) set.delete(fmt);
      else set.add(fmt);
      return { ...d, formats: Array.from(set) };
    });
  };

  const saveTemplate = async () => {
    if (!draft.code || !draft.name) {
      alert("Kód és Név kötelező.");
      return;
    }
    if (!draft.formats?.length) {
      alert("Legalább egy formátumot válassz.");
      return;
    }
    if (!draft.queryText) {
      alert("A lekérdezés szövege kötelező.");
      return;
    }

    // helper az AdminReportDesigner-hez
    const toBackendParamType = (t) => {
      switch (t) {
        case "dateRange":
          return "DATE_RANGE";
        case "enum":
          return "ENUM";
        case "text":
          return "TEXT";
        case "number":
          return "NUMBER";
        case "checkbox":
          return "CHECKBOX";
        default:
          return t;
      }
    };

    const normalizeTemplateForApi = (tpl) => ({
      code: tpl.code, // <-- KÖTELEZŐ
      name: tpl.name,
      description: tpl.description,
      queryType: tpl.queryType || "SQL", // <-- valószínűleg KÖTELEZŐ
      queryText: tpl.queryText || "", // <-- valószínűleg KÖTELEZŐ
      formats: tpl.formats || [],
      parameters: (tpl.parameters || []).map((p) => ({
        key: p.key,
        label: p.label,
        type: toBackendParamType(p.type),
        defaultValue: p.default ?? null,
        options: p.options
          ? p.options.map((o) => ({ id: o.id, label: o.label }))
          : []
      }))
    });

    const payload = normalizeTemplateForApi(draft);
    if (editing) {
      await onUpdate?.(editing, payload);
    } else {
      await onCreate?.(payload);
    }
    setShowModal(false);
  };

  const removeTemplate = async (id) => {
    if (!window.confirm("Biztosan törlöd ezt a sablont?")) return;
    await onDelete?.(id);
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">
          <i className="bi bi-gear-wide-connected me-2" />
          Report designer (admin)
        </Card.Title>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted">
            Sablonok kezelése: név, leírás, paraméterek, formátumok.
          </div>
          <Button onClick={openCreate}>
            <i className="bi bi-plus-lg me-1" />
            Új sablon
          </Button>
        </div>

        <Table hover responsive size="sm" className="mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Név</th>
              <th>Leírás</th>
              <th>Paraméterek</th>
              <th>Formátumok</th>
              <th className="text-end">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id}>
                <td>
                  <code>{t.id}</code>
                </td>
                <td>{t.name}</td>
                <td className="text-truncate" style={{ maxWidth: 280 }}>
                  {t.description}
                </td>
                <td>
                  {(t.parameters || []).map((p) => (
                    <Badge bg="light" text="dark" key={p.key} className="me-1">
                      {p.label} <small className="text-muted">({p.type})</small>
                    </Badge>
                  ))}
                </td>
                <td>
                  {(t.formats || []).map((f) => (
                    <Badge bg="secondary" key={f} className="me-1">
                      {f}
                    </Badge>
                  ))}
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => openEdit(t)}
                  >
                    <i className="bi bi-pencil-square" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeTemplate(t.id)}
                  >
                    <i className="bi bi-trash" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Editor modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editing ? "Sablon szerkesztése" : "Új sablon"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>ID</Form.Label>
                <Form.Control
                  placeholder="pl. rep-boards-by-color"
                  value={draft.id}
                  disabled={!!editing}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, id: e.target.value.trim() }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Név</Form.Label>
                <Form.Control
                  placeholder="Sablon megnevezés"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                />
              </Col>
              <Col md={12}>
                <Form.Label>Leírás</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Rövid leírás"
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                />
              </Col>

              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="m-0">Paraméterek</Form.Label>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={addParam}
                  >
                    <i className="bi bi-plus-lg me-1" />
                    Új paraméter
                  </Button>
                </div>

                {(draft.parameters || []).map((p, i) => (
                  <Card key={i} className="mb-2">
                    <Card.Body>
                      <Row className="g-2 align-items-end">
                        <Col md={3}>
                          <Form.Label>Kulcs</Form.Label>
                          <Form.Control
                            placeholder="pl. period"
                            value={p.key}
                            onChange={(e) =>
                              updateParam(i, { key: e.target.value.trim() })
                            }
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label>Típus</Form.Label>
                          <Form.Select
                            value={p.type}
                            onChange={(e) =>
                              updateParam(i, { type: e.target.value })
                            }
                          >
                            {PARAM_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={4}>
                          <Form.Label>Címke</Form.Label>
                          <Form.Control
                            placeholder="pl. Időszak"
                            value={p.label || ""}
                            onChange={(e) =>
                              updateParam(i, { label: e.target.value })
                            }
                          />
                        </Col>
                        <Col md={2} className="text-end">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeParam(i)}
                          >
                            <i className="bi bi-x-lg" />
                          </Button>
                        </Col>
                      </Row>

                      {/* enum extra: options builder */}
                      {p.type === "enum" && (
                        <div className="mt-2">
                          <Form.Label>Opciók</Form.Label>
                          {(p.options || [{ id: "any", label: "Mind" }]).map(
                            (opt, oi) => (
                              <InputGroup className="mb-1" key={oi}>
                                <Form.Control
                                  placeholder="azonosító (id)"
                                  value={opt.id}
                                  onChange={(e) => {
                                    const options = [...(p.options || [])];
                                    options[oi] = {
                                      ...opt,
                                      id: e.target.value
                                    };
                                    updateParam(i, { options });
                                  }}
                                />
                                <Form.Control
                                  placeholder="címke (label)"
                                  value={opt.label}
                                  onChange={(e) => {
                                    const options = [...(p.options || [])];
                                    options[oi] = {
                                      ...opt,
                                      label: e.target.value
                                    };
                                    updateParam(i, { options });
                                  }}
                                />
                                <Button
                                  variant="outline-danger"
                                  onClick={() => {
                                    const options = [...(p.options || [])];
                                    options.splice(oi, 1);
                                    updateParam(i, { options });
                                  }}
                                >
                                  <i className="bi bi-trash" />
                                </Button>
                              </InputGroup>
                            )
                          )}
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => {
                              const options = [...(p.options || [])];
                              options.push({ id: "", label: "" });
                              updateParam(i, { options });
                            }}
                          >
                            + Opció
                          </Button>
                        </div>
                      )}

                      {/* default value */}
                      <div className="mt-2">
                        <Form.Label>
                          Alapértelmezett érték (opcionális)
                        </Form.Label>
                        <Form.Control
                          placeholder="pl. any / 0 / true / szöveg…"
                          value={p.default ?? ""}
                          onChange={(e) =>
                            updateParam(i, { default: e.target.value })
                          }
                        />
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Col>

              <Col md={12}>
                <Form.Label>Elérhető formátumok</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {availableFormats.map((fmt) => {
                    const checked = draft.formats?.includes(fmt);
                    return (
                      <Form.Check
                        key={fmt}
                        inline
                        type="checkbox"
                        id={`fmt-${fmt}`}
                        label={fmt}
                        checked={checked}
                        onChange={() => toggleFormat(fmt)}
                      />
                    );
                  })}
                </div>
              </Col>
              <Col md={6}>
                <Form.Label>Kód</Form.Label>
                <Form.Control
                  placeholder="pl. rep-orders-by-client"
                  value={draft.code || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, code: e.target.value.trim() }))
                  }
                />
              </Col>

              <Col md={6}>
                <Form.Label>Lekérdezés típusa</Form.Label>
                <Form.Select
                  value={draft.queryType || "SQL"}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, queryType: e.target.value }))
                  }
                >
                  <option value="SQL">SQL</option>
                  {/* ha vannak más típusok is, sorold fel itt */}
                </Form.Select>
              </Col>

              <Col md={12}>
                <Form.Label>Lekérdezés</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder="SELECT ... FROM ..."
                  value={draft.queryText || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, queryText: e.target.value }))
                  }
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Mégse
            </Button>
            <Button onClick={saveTemplate}>Mentés</Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
}

// ====== Eredeti “dashboard” részek dummyval (rövidítve) ======
function KpiAndSamples() {
  const kpis = {
    totalWorks: 128,
    completedWorks: 92,
    scheduledToday: 11,
    totalBoards: 347.5
  };
  const monthlyWorks = [
    { month: "Jan", count: 18 },
    { month: "Feb", count: 21 },
    { month: "Már", count: 25 },
    { month: "Ápr", count: 27 },
    { month: "Máj", count: 22 },
    { month: "Jún", count: 15 }
  ];
  const maxMonthly = Math.max(...monthlyWorks.map((m) => m.count));

  return (
    <>
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted">Összes munka</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                {kpis.totalWorks}
              </div>
              <Badge bg="secondary">YTD</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted">Kész munkák</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                {kpis.completedWorks}
              </div>
              <small className="text-success">
                <i className="bi bi-check2-circle me-1" />
                72%
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted">Ma ütemezve</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                {kpis.scheduledToday}
              </div>
              <small className="text-primary">
                <i className="bi bi-calendar2-week me-1" />
                mai nap
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted">Összes tábla</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                {kpis.totalBoards}
              </div>
              <small className="text-muted">felhasználva (becslés)</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Havi munkaszám</Card.Title>
              {monthlyWorks.map((m) => (
                <div key={m.month} className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{m.month}</span>
                    <span>
                      <strong>{m.count}</strong>
                    </span>
                  </div>
                  <ProgressBar now={(m.count / maxMonthly) * 100} />
                </div>
              ))}
              <div className="mt-3 text-muted" style={{ fontSize: ".9rem" }}>
                Egyszerű vizualizáció — később lecserélheted tényleges
                grafikonra.
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Top felhasználók</Card.Title>
              <Table hover responsive size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Felhasználó</th>
                    <th className="text-end">Munkák</th>
                    <th className="text-end">Táblák</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Kiss Béla", works: 34, boards: 86.5 },
                    { name: "Nagy Anna", works: 29, boards: 78.0 },
                    { name: "Tóth Ádám", works: 25, boards: 66.0 }
                  ].map((u) => (
                    <tr key={u.name}>
                      <td>{u.name}</td>
                      <td className="text-end">{u.works}</td>
                      <td className="text-end">{u.boards}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

function ReportsPage() {
  const dispatch = useDispatch();
  const role = useSelector((s) => s.auth?.user?.role);
  const isAdmin = role === "admin" || role === "companyAdmin";
  const templates = useSelector((s) => s.reports?.templates || []);
  const loading = useSelector((s) => s.reports?.loading); // ha csináltál ilyet

  useEffect(() => {
    // Ha a reportApi thunk és dispatch-el, akkor:
    reportApi.getAllReportTemplatesApi();
  }, [dispatch]);

  const handleExport = async (templateId, format, params) => {
    try {
      const { blob, filename } = await reportApi.runReportApi(
        templateId,
        format,
        params
      );
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("Report export hiba:", err);
      alert("Nem sikerült az export.");
    }
  };

  const handleCreate = async (tpl) => {
    await dispatch(reportApi.createReportTemplateApi(tpl));
  };
  const handleUpdate = async (id, tpl) => {
    await dispatch(reportApi.updateReportTemplateApi(id, tpl));
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Biztosan törlöd ezt a sablont?")) return;
    await dispatch(reportApi.deleteReportTemplateApi(id));
  };

  return (
    <Container fluid style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      {/* ... KPI stb. maradhat */}
      <ReportExportPanel templates={templates} onExport={handleExport} />

      {isAdmin && (
        <AdminReportDesigner
          templates={templates}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </Container>
  );
}

export default ReportsPage;
