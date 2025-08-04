import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllWorks } from "../../../data/getters";
import Loading from "../../helpers/Loading";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO
} from "date-fns";
import { hu } from "date-fns/locale";
import workApi from "../../../data/api/workApi";
function capitalizeFirst(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}
const WEEKDAYS_HU = [
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Szombat",
  "Vasárnap"
];

function SchedulePage() {
  const dispatch = useDispatch();
  const works = useSelector((state) => state.works || []);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  useEffect(() => {
    async function load() {
      await dispatch(getAllWorks());
      setLoading(false);
    }
    load();
  }, [dispatch]);

  const goPrev = () => {
    if (view === "month") {
      setCurrentDate((d) => addDays(startOfMonth(d), -1));
    } else if (view === "week") {
      setCurrentDate((d) => addDays(d, -7));
    } else {
      setCurrentDate((d) => addDays(d, -1));
    }
  };
  const goNext = () => {
    if (view === "month") {
      setCurrentDate((d) => addDays(endOfMonth(d), 1));
    } else if (view === "week") {
      setCurrentDate((d) => addDays(d, 7));
    } else {
      setCurrentDate((d) => addDays(d, 1));
    }
  };

  // Calendar mátrix havi nézethez
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthStartDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthEndDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthRows = [];
  let day = monthStartDate;
  while (day <= monthEndDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    monthRows.push(week);
  }

  // Heti nézethez
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  // Napi nézet
  const dayWorks = works.filter((w) => {
    if (!w.scheduleDate) return false;
    const sd = parseISO(w.scheduleDate);
    return isSameDay(sd, currentDate);
  });

  // Be nem ütemezett munkák
  const unscheduledWorks = works.filter((w) => !w.scheduleDate);
  const navigationBarStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexWrap: "nowrap", // FONTOS: ne törjön sort!
    height: "46px", // FIX magasság!
    minHeight: "46px",
    maxHeight: "46px",
    boxSizing: "border-box"
  };

  // Title fix, ha túl hosszú is, elférjen
  const titleStyle = {
    fontSize: "1.1rem",
    fontWeight: 500,
    minWidth: "160px",
    maxWidth: "280px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flexShrink: 1,
    textAlign: "center"
  };

  // Gomb fix méret
  const navBtnStyle = {
    padding: "0.15rem 0.6rem",
    fontSize: "1rem",
    cursor: "pointer",
    borderRadius: "7px",
    border: "1px solid #bbb",
    background: "#f5f5f5",
    minWidth: "34px",
    minHeight: "32px"
  };

  // Nézet gomb fix szélesség
  const viewBtnBase = {
    border: "1px solid #1976d2",
    borderRadius: "7px",
    padding: "0.10rem 0.6rem",
    cursor: "pointer",
    minWidth: "58px",
    minHeight: "32px",
    fontSize: "0.98em",
    textAlign: "center"
  };
  // Munka “kártya” doboz
  const today = new Date();

  const WorkBox = ({ w, draggable, onDragStart }) => (
    <div
      key={w.workId}
      style={{
        marginBottom: "0.17rem",
        padding: "0.14rem 0.25rem",
        background: "#e3f2fd",
        borderRadius: "3px",
        cursor: draggable ? "grab" : "default",
        fontSize: "0.81rem",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        border: "1px solid #90caf9",
        opacity: draggable ? 1 : 0.5
      }}
      title={`#${w.workId} - ${w.name} | ${w.user?.name || "–"}`}
      draggable={draggable}
      onDragStart={draggable ? (e) => onDragStart(e, w.workId) : undefined}
    >
      <span style={{ color: "#1976d2" }}>{w.user?.name || "–"}</span>
      {" - "}
      <b>#{w.workId}</b> - {w.name}
    </div>
  );

  // Drag & Drop
  const handleDragStart = (e, workId) => {
    e.dataTransfer.setData("workId", workId);
  };

  const handleDrop = async (e, targetDate) => {
    e.preventDefault();
    const workId = e.dataTransfer.getData("workId");
    if (!workId) return;

    // Csak ha a cél dátum NEM múltbeli!
    const today = new Date();
    const dateObj = new Date(targetDate);
    dateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) return; // múltba nem lehet!

    // Küldjük az új dátumot!
    await dispatch(workApi.updateWorkApi(workId, { scheduleDate: targetDate }));
    // ha szeretnél, akkor utána újra lekérheted a work-öket, de a Redux is frissül.
  };
  const handleDragOver = (e, day) => {
    // Csak jövőbeli napra engedjük
    const today = new Date();
    day.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (day >= today) e.preventDefault();
  };

  if (loading) return <Loading />;

  // Nézet felirat
  let title;
  if (view === "month") {
    const m = format(currentDate, "LLLL yyyy", { locale: hu });
    title = capitalizeFirst(m);
  } else if (view === "week") {
    const w1 = format(weekDays[0], "yyyy.MM.dd", { locale: hu });
    const w2 = format(weekDays[6], "yyyy.MM.dd", { locale: hu });
    title = `Hét: ${w1} – ${w2}`;
  } else {
    const d = format(currentDate, "yyyy.MM.dd, EEEE", { locale: hu });
    title = capitalizeFirst(d);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        fontFamily: "sans-serif",
        minHeight: "520px",
        width: "100%",
        height: "calc(100vh - 60px)",
        boxSizing: "border-box"
      }}
    >
      {/* Bal panel: naptár + navigáció */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 1px 8px #c7d1df22",
          padding: "16px 16px 16px 18px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          marginRight: "16px",
          maxHeight: "90vh"
        }}
      >
        {/* Navigációs bar */}
        <div style={navigationBarStyle}>
          <button onClick={goPrev} style={navBtnStyle}>
            ‹
          </button>
          <span style={titleStyle}>{title}</span>
          <button onClick={goNext} style={navBtnStyle}>
            ›
          </button>
          <button
            style={{
              ...viewBtnBase,
              marginLeft: "1.1rem",
              background: view === "month" ? "#1976d2" : "#f5f5f5",
              color: view === "month" ? "#fff" : "#1976d2",
              fontWeight: view === "month" ? "bold" : 400
            }}
            onClick={() => setView("month")}
          >
            Hónap
          </button>
          <button
            style={{
              ...viewBtnBase,
              background: view === "week" ? "#1976d2" : "#f5f5f5",
              color: view === "week" ? "#fff" : "#1976d2",
              fontWeight: view === "week" ? "bold" : 400
            }}
            onClick={() => setView("week")}
          >
            Hét
          </button>
          <button
            style={{
              ...viewBtnBase,
              background: view === "day" ? "#1976d2" : "#f5f5f5",
              color: view === "day" ? "#fff" : "#1976d2",
              fontWeight: view === "day" ? "bold" : 400
            }}
            onClick={() => setView("day")}
          >
            Nap
          </button>
        </div>
        {/* Aktuális nézet */}
        <div
          style={{
            flex: 1,
            minHeight: "280px",
            overflowX: "auto",
            maxHeight: "90vh"
          }}
        >
          {view === "month" && (
            <table
              style={{
                width: "100%",
                minWidth: "630px",
                borderCollapse: "collapse",
                tableLayout: "fixed"
              }}
            >
              <thead>
                <tr>
                  {WEEKDAYS_HU.map((d, idx) => (
                    <th
                      key={d}
                      style={{
                        padding: "4px",
                        textAlign: "center",
                        background: "#f0f0f0",
                        border: "1px solid #ccc",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        color: idx >= 5 ? "#c62828" : "#333"
                      }}
                    >
                      {capitalizeFirst(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthRows.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((day, di) => {
                      const cellWorks = works.filter((w) => {
                        if (!w.scheduleDate) return false;
                        const sd = parseISO(w.scheduleDate);
                        return isSameDay(sd, day);
                      });
                      const isWeekend = di >= 5;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const cellDay = new Date(day);
                      cellDay.setHours(0, 0, 0, 0);
                      const isPast = cellDay < today;
                      let background;
                      if (isPast) {
                        background = isWeekend ? "#e1e1e1" : "#ededed"; // szürkébb hétvége/munkanap
                      } else if (isSameMonth(day, monthStart)) {
                        background = isWeekend ? "#ffeaea" : "#fff";
                      } else {
                        background = isWeekend ? "#fff5f5" : "#f9f9f9";
                      }
                      return (
                        <td
                          key={di}
                          onDrop={(e) => {
                            // Csak jövőbeli napra engedjük
                            if (day >= today)
                              handleDrop(e, format(day, "yyyy-MM-dd"));
                          }}
                          onDragOver={(e) => {
                            // Csak jövőbeli napra engedjük
                            if (day >= today) handleDragOver(e, day);
                          }}
                          style={{
                            border: "1px solid #ccc",
                            verticalAlign: "top",
                            minWidth: "86px",
                            height: "13vh", // <--- FIXED CELL HEIGHT!
                            maxHeight: "13vh",
                            padding: "2px 2px 2px 4px",
                            fontSize: "0.8rem",
                            background,
                            color: isWeekend ? "#b71c1c" : "#222",
                            overflow: "hidden"
                            /*  filter: isPast
                              ? "grayscale(0.7) brightness(0.90)"
                              : undefined*/
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              marginBottom: "0.22rem",
                              color: isWeekend ? "#c62828" : "#222",
                              fontSize: "0.98em"
                            }}
                          >
                            {format(day, "d", { locale: hu })}
                          </div>
                          <div
                            style={{
                              maxHeight: "10vh",
                              overflowY: "auto"
                            }}
                          >
                            {cellWorks.map((w) => (
                              <WorkBox
                                key={w.workId}
                                w={w}
                                draggable={
                                  !w.scheduleDate ||
                                  parseISO(w.scheduleDate) >= today
                                } // csak jövő/jelen
                                onDragStart={handleDragStart}
                              />
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {view === "week" && (
            <table
              style={{
                width: "100%",
                minWidth: "630px",
                borderCollapse: "collapse",
                tableLayout: "fixed"
              }}
            >
              <thead>
                <tr>
                  {WEEKDAYS_HU.map((d, idx) => (
                    <th
                      key={d}
                      style={{
                        padding: "4px",
                        textAlign: "center",
                        background: "#f0f0f0",
                        border: "1px solid #ccc",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        color: idx >= 5 ? "#c62828" : "#333"
                      }}
                    >
                      {capitalizeFirst(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {weekDays.map((day, di) => {
                    const cellWorks = works.filter((w) => {
                      if (!w.scheduleDate) return false;
                      const sd = parseISO(w.scheduleDate);
                      return isSameDay(sd, day);
                    });
                    const isWeekend = di >= 5;
                    return (
                      <td
                        key={di}
                        style={{
                          border: "1px solid #ccc",
                          verticalAlign: "top",
                          minWidth: "86px",
                          height: "110px",
                          maxHeight: "110px",
                          padding: "2px 2px 2px 4px",
                          fontSize: "0.8rem",
                          background: isWeekend ? "#ffeaea" : "#fff",
                          color: isWeekend ? "#b71c1c" : "#222",
                          overflow: "hidden"
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            marginBottom: "0.22rem",
                            color: isWeekend ? "#c62828" : "#222",
                            fontSize: "0.98em"
                          }}
                        >
                          {format(day, "d", { locale: hu })}
                        </div>
                        <div
                          style={{
                            maxHeight: "76px",
                            overflowY: "auto"
                          }}
                        >
                          {cellWorks.map((w) => (
                            <WorkBox key={w.workId} w={w} />
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          )}
          {view === "day" && (
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1.0rem",
                background: "#fafcff",
                minHeight: "120px"
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.08rem",
                  marginBottom: "0.5rem",
                  color: "#1976d2"
                }}
              >
                {capitalizeFirst(
                  format(currentDate, "yyyy. MMMM d., EEEE", { locale: hu })
                )}
              </div>
              {dayWorks.length === 0 ? (
                <div style={{ color: "#888" }}>Nincs munka erre a napra.</div>
              ) : (
                dayWorks.map((w) => <WorkBox key={w.workId} w={w} />)
              )}
            </div>
          )}
        </div>
      </div>
      {/* Jobb oldal - be nem ütemezett munkák */}
      <div
        style={{
          width: "300px",
          minWidth: "70px",
          maxWidth: "300px",
          padding: "16px 6px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 1px 8px #c7d1df11",
          maxHeight: "90vh",
          overflowY: "auto",
          fontSize: "0.89em",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            marginTop: 0,
            marginBottom: "0.8rem",
            fontSize: "0.99rem",
            color: "#d81b60",
            fontWeight: 700
          }}
        >
          Be nem ütemezett munkák
        </div>
        {unscheduledWorks.length === 0 ? (
          <div style={{ color: "#999", fontSize: "0.89em" }}>
            <span style={{ fontSize: "1.5em" }}>
              Nincs jelenleg ütemezésre váró munka
            </span>
          </div>
        ) : (
          unscheduledWorks.map((w) => (
            <div
              key={w.workId}
              draggable
              onDragStart={(e) => handleDragStart(e, w.workId)}
              style={{
                background: "#ffebee",
                borderRadius: "6px",
                border: "1px solid #f8bbd0",
                marginBottom: "0.32rem",
                padding: "0.23rem 0.20rem",
                fontSize: "0.88em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
              title={`#${w.workId} - ${w.name} | ${w.user?.name || "–"}`}
            >
              <b>#{w.workId}</b>
              <br />
              <span style={{ color: "#b71c1c" }}>{w.user?.name || "–"}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SchedulePage;
