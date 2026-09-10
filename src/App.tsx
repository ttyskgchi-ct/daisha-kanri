import { useState, useEffect, useRef } from "react";
import {
  format,
  addDays,
  differenceInDays,
  parseISO,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@supabase/supabase-js";
import {
  Calendar,
  CalendarDays,
  Car,
  Plus,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import TomorrowRentalList from "./TomorrowRentalList";

// ==========================================================
// 1. Supabase 接続設定
// ==========================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables in .env.local");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================================
// 2. 型定義
// ==========================================================
export interface DaishaMaster {
  id: string;
  car_name: string;
  number_plate: string;
  body_color: string;
  size_type: "軽自動車" | "普通車";
  status: "貸出可" | "貸出不可" | "非稼働";
  inspection_date: string;
  last_oil_change_date: string;
  has_etc: boolean;
  note?: string | null;
}

export interface DaishaReservation {
  id: string;
  car_id: string | null;
  start_at: string;
  end_at: string;
  customer_name: string;
  car_type: string;
  purpose: string;
  staff_name: string;
  status: "確定" | "保留" | "キャンセル";
  note: string | null;
  size_limit?: "限定なし" | "軽自動車" | "普通車";
}

// ──────────────────────────────────────────────────────────
// ★ SP用 アコーディオン車両カードコンポーネント
// ──────────────────────────────────────────────────────────
const CarAccordionItem: React.FC<{
  car: DaishaMaster;
  reservations: DaishaReservation[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelectReservation: (res: DaishaReservation) => void;
}> = ({ car, reservations, isExpanded, onToggle, onSelectReservation }) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        marginBottom: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: isExpanded ? "#f8fafc" : "#fff",
          borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{ fontWeight: "bold", fontSize: "15px", color: "#1e293b" }}
            >
              {car.car_name}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#2563eb",
                backgroundColor: "#eff6ff",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              {car.number_plate}
            </span>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <span>区分: {car.size_type}</span>
            <span>ステータス: {car.status}</span>
            <span
              style={{
                fontSize: "11px",
                backgroundColor: "#f1f5f9",
                padding: "1px 6px",
                borderRadius: "4px",
                color: "#475569",
              }}
            >
              予約 {reservations.length}件
            </span>
          </div>
        </div>
        <div style={{ color: "#64748b", display: "flex", alignItems: "center" }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fff" }}>
          {/* 車両詳細情報 */}
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "12px",
              paddingBottom: "8px",
              borderBottom: "1px dashed #e2e8f0",
            }}
          >
            <span>色: {car.body_color || "未登録"}</span>
            <span>|</span>
            <span>ETC: {car.has_etc ? "あり" : "なし"}</span>
            <span>|</span>
            <span>
              車検:{" "}
              {car.inspection_date
                ? format(new Date(car.inspection_date), "yy/MM/dd")
                : "未登録"}
            </span>
            {car.note && (
              <div
                style={{ width: "100%", marginTop: "2px", color: "#475569" }}
              >
                備考: {car.note}
              </div>
            )}
          </div>

          {/* 確定予約一覧 */}
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#334155",
              marginBottom: "8px",
            }}
          >
            確定予約一覧
          </div>
          {reservations.length === 0 ? (
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                textAlign: "center",
                padding: "12px 0",
              }}
            >
              現在、確定した予約はありません
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {reservations.map((res) => (
                <div
                  key={res.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectReservation(res);
                  }}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    backgroundColor: "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "13px",
                        color: "#1e293b",
                      }}
                    >
                      {res.customer_name} 様
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "#3b82f6",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {res.purpose}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#475569",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <div>
                      期間: {format(parseISO(res.start_at), "M/d HH:mm")} ～{" "}
                      {format(parseISO(res.end_at), "M/d HH:mm")}
                    </div>
                    <div>
                      車種: {res.car_type || "未入力"} | 担当: {res.staff_name}
                    </div>
                    {res.size_limit && res.size_limit !== "限定なし" && (
                      <span
                        style={{
                          color: "#dc2626",
                          fontWeight: "bold",
                          fontSize: "10px",
                          marginTop: "2px",
                        }}
                      >
                        ※{res.size_limit === "軽自動車" ? "軽限定" : "普通車限定"}
                      </span>
                    )}
                    {res.note && (
                      <div
                        style={{
                          color: "#64748b",
                          fontStyle: "italic",
                          marginTop: "2px",
                        }}
                      >
                        備考: {res.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  // ─── メイン画面切り替え ───
  const [activeTab, setActiveTab] = useState<"calendar" | "cars" | "tomorrow">(
    "calendar",
  );

  // ─── 状態管理 ───
  const [cars, setCars] = useState<DaishaMaster[]>([]);
  const [reservations, setReservations] = useState<DaishaReservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStartDate, setCurrentStartDate] = useState<Date>(new Date());
  const [filterText, setFilterText] = useState("");
  const [currentView, setCurrentView] = useState<"日" | "週" | "2週間" | "月">(
    "2週間",
  );

  const [hoveredResId, setHoveredResId] = useState<string | null>(null);

  // SP用 アコーディオン開閉状態管理
  const [expandedCarIds, setExpandedCarIds] = useState<Record<string, boolean>>(
    {},
  );

  const toggleCarAccordion = (carId: string) => {
    setExpandedCarIds((prev) => ({
      ...prev,
      [carId]: !prev[carId],
    }));
  };

  // ──────────────────────────────────────────────────────────
  // ★ 画面幅（SP判定）用 State と監視処理
  // ──────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // リサイズ専用のState
  const [resizingResId, setResizingResId] = useState<string | null>(null);
  const [resizingCurrentTargetDate, setResizingCurrentTargetDate] =
    useState<Date | null>(null);

  // 保留エリアへのドラッグホバー状態管理
  const [isDragOverPending, setIsDragOverPending] = useState<boolean>(false);

  // ドラッグ操作かクリック操作かを判別するためのフラグ
  const isDraggingOrResizing = useRef<boolean>(false);

  // ★ カレンダー全体参照用のRef（グローバルマウス位置計算用）
  const calendarGridRef = useRef<HTMLDivElement | null>(null);

  // 日時フォーマット用のヘルパー関数
  const getInitialDateTimeString = (baseDate: Date, hour: number = 9) => {
    const d = new Date(baseDate);
    d.setHours(hour, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ─── 予約新規登録モーダル用の状態管理 ───
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

  const [formDataStart, setFormDataStart] = useState(() =>
    getInitialDateTimeString(new Date(), 9),
  );
  const [formDataEnd, setFormDataEnd] = useState(() =>
    getInitialDateTimeString(new Date(), 18),
  );

  const handleStartChange = (newStartValue: string) => {
    setFormDataStart(newStartValue);

    if (newStartValue) {
      const startDate = new Date(newStartValue);
      if (!isNaN(startDate.getTime())) {
        const autoEndStr = getInitialDateTimeString(startDate, 18);
        setFormDataEnd(autoEndStr);
      }
    }
  };

  const [formSizeType, setFormSizeType] = useState<
    "限定なし" | "軽自動車" | "普通車"
  >("限定なし");
  const [formSelectedCarId, setFormSelectedCarId] = useState<string | null>(
    null,
  );

  const [formCustomerName, setFormCustomerName] = useState("");
  const [formCarType, setFormCarType] = useState("");
  const [formPurpose, setFormPurpose] = useState("車検");
  const [formStaffName, setFormStaffName] = useState("");
  const [formNote, setFormNote] = useState("");

  // ─── 予約詳細・編集モーダル用の状態管理 ───
  const [selectedReservation, setSelectedReservation] =
    useState<DaishaReservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCarType, setEditCarType] = useState("");
  const [editPurpose, setEditPurpose] = useState("車検");
  const [editStaffName, setEditStaffName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editSizeType, setEditSizeType] = useState<
    "限定なし" | "軽自動車" | "普通車"
  >("限定なし");

  // ─── 代車マスタ管理（追加・編集モーダル）用の状態管理 ───
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<DaishaMaster | null>(null);

  const [carFormName, setCarFormName] = useState("");
  const [carFormNumber, setCarFormNumber] = useState("");
  const [carFormColor, setCarFormColor] = useState("");
  const [carFormSize, setCarFormSize] = useState<"軽自動車" | "普通車">(
    "軽自動車",
  );
  const [carFormStatus, setCarFormStatus] = useState<"貸出可" | "貸出不可">(
    "貸出可",
  );
  const [carFormInspection, setCarFormInspection] = useState("");
  const [carFormOil, setCarFormOil] = useState("");
  const [carFormEtc, setCarFormEtc] = useState(false);
  const [carFormNote, setCarFormNote] = useState("");

  // ─── カレンダー表示範囲計算 ───
  const daysCount =
    currentView === "日"
      ? 1
      : currentView === "週"
        ? 7
        : currentView === "2週間"
          ? 14
          : 30;
  const daysArray = Array.from({ length: daysCount }, (_, i) =>
    addDays(currentStartDate, i),
  );
  const timelineStart = startOfDay(daysArray[0]);
  const timelineEnd = endOfDay(daysArray[daysCount - 1]);

  // ─── データの取得 ───
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: carData, error: carError } = await supabase
        .from("daisha_masters")
        .select("*")
        .neq("status", "非稼働")
        .order("car_name", { ascending: true });

      if (carError) throw carError;
      setCars(carData as DaishaMaster[]);

      const { data: resData, error: resError } = await supabase
        .from("daisha_reservations")
        .select("*")
        .neq("status", "キャンセル")
        .order("start_at", { ascending: true });

      if (resError) throw resError;
      setReservations(resData as DaishaReservation[]);
    } catch (err) {
      console.error("データの取得に失敗しました:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentStartDate]);

  const pendingReservations = reservations.filter(
    (r) => r.status === "保留" || !r.car_id,
  );
  const confirmedReservations = reservations.filter(
    (r) => r.status === "確定" && r.car_id,
  );

  // ==========================================================
  // ★ マウスイベントによるリサイズ（期間伸縮）のグローバル解放処理
  // ==========================================================
  const stateRef = useRef({
    resizingResId,
    resizingCurrentTargetDate,
    reservations,
    confirmedReservations,
    fetchData,
  });

  useEffect(() => {
    stateRef.current = {
      resizingResId,
      resizingCurrentTargetDate,
      reservations,
      confirmedReservations,
      fetchData,
    };
  }, [resizingResId, resizingCurrentTargetDate, reservations, confirmedReservations]);

  useEffect(() => {
    const handleGlobalMouseUp = async () => {
      const state = stateRef.current;

      if (state.resizingResId && state.resizingCurrentTargetDate) {
        const targetRes = state.reservations.find(
          (r) => r.id === state.resizingResId,
        );

        if (targetRes) {
          let newStart = targetRes.start_at;
          const originalEndTime = parseISO(targetRes.end_at);
          const updatedEnd = new Date(state.resizingCurrentTargetDate);

          updatedEnd.setHours(
            originalEndTime.getHours(),
            originalEndTime.getMinutes(),
            0,
            0,
          );

          if (isBefore(updatedEnd, parseISO(targetRes.start_at))) {
            alert("返却予定日時を開始日時より前に設定することはできません。");
          } else {
            const newEnd = updatedEnd.toISOString();

            const hasConflict = state.confirmedReservations.some(
              (r) =>
                r.car_id === targetRes.car_id &&
                r.id !== state.resizingResId &&
                isBefore(parseISO(r.start_at), parseISO(newEnd)) &&
                isAfter(parseISO(r.end_at), parseISO(newStart)),
            );

            if (hasConflict) {
              alert(
                "変更先の日時に既存の別の予約と重複があるため、変更できません。",
              );
            } else {
              try {
                const { error } = await supabase
                  .from("daisha_reservations")
                  .update({ end_at: newEnd })
                  .eq("id", state.resizingResId);

                if (error) throw error;
                await state.fetchData();
              } catch (err) {
                console.error("予約期間の変更に失敗しました:", err);
                alert("期間の保存に失敗しました。");
              }
            }
          }
        }

        setResizingResId(null);
        setResizingCurrentTargetDate(null);
        setTimeout(() => {
          isDraggingOrResizing.current = false;
        }, 50);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // ─── ドラッグ＆ドロップ (予約の代車間移動) ───
  const handleDragStart = (e: React.DragEvent, reservationId: string) => {
    if (resizingResId) {
      e.preventDefault();
      return;
    }
    isDraggingOrResizing.current = true;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", reservationId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleGridCellDrop = async (e: React.DragEvent, carId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (resizingResId) return;

    const reservationId = e.dataTransfer.getData("text/plain");
    if (!reservationId) return;

    await handleDropOnCar(reservationId, carId);
    setTimeout(() => {
      isDraggingOrResizing.current = false;
    }, 50);
  };

  const handleDropOnCar = async (reservationId: string, carId: string) => {
    const targetRes = reservations.find((r) => r.id === reservationId);
    const targetCar = cars.find((c) => c.id === carId);

    if (targetRes && targetCar) {
      if (targetRes.car_id === carId && targetRes.status === "確定") {
        return;
      }

      if (
        targetRes.size_limit === "軽自動車" &&
        targetCar.size_type !== "軽自動車"
      ) {
        alert(
          "この予約は【軽自動車限定】のため、普通車へ配置することはできません。",
        );
        return;
      }
      if (
        targetRes.size_limit === "普通車" &&
        targetCar.size_type !== "普通車"
      ) {
        alert(
          "この予約は【普通車限定】のため、軽自動車へ配置することはできません。",
        );
        return;
      }

      const hasConflict = confirmedReservations.some(
        (r) =>
          r.car_id === carId &&
          r.id !== reservationId &&
          isBefore(parseISO(r.start_at), parseISO(targetRes.end_at)) &&
          isAfter(parseISO(r.end_at), parseISO(targetRes.start_at)),
      );
      if (hasConflict) {
        alert(
          "移動先の期間に既に別の予約が入っているため、割り当てできません。(ダブルブッキング防止)",
        );
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("daisha_reservations")
        .update({ car_id: carId, status: "確定" })
        .eq("id", reservationId);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error("予約の移動に失敗しました:", err);
    }
  };

  const handleDropOnPendingZone = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPending(false);
    const reservationId = e.dataTransfer.getData("text/plain");
    if (!reservationId) return;
    try {
      const { error } = await supabase
        .from("daisha_reservations")
        .update({ car_id: null, status: "保留" })
        .eq("id", reservationId);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error("保留への変更に失敗しました:", err);
    } finally {
      setTimeout(() => {
        isDraggingOrResizing.current = false;
      }, 50);
    }
  };

  // ─── マウスイベント (期間の伸縮専用: X座標ベースでの絶対位置計算) ───
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    reservationId: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingOrResizing.current = true;

    setResizingResId(reservationId);
    const targetRes = reservations.find((r) => r.id === reservationId);
    if (targetRes) {
      setResizingCurrentTargetDate(parseISO(targetRes.end_at));
    }

    const gridEl = calendarGridRef.current;
    if (!gridEl) return;

    const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
      const rect = gridEl.getBoundingClientRect();
      const offsetX = moveEvent.clientX - rect.left;
      const ratio = Math.min(Math.max(offsetX / rect.width, 0), 0.999);
      const targetDayIndex = Math.floor(ratio * daysCount);
      const clampedIndex = Math.min(Math.max(targetDayIndex, 0), daysCount - 1);

      setResizingCurrentTargetDate(daysArray[clampedIndex]);
    };

    const handleGlobalMouseUpLocal = () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUpLocal);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUpLocal);
  };

  const getCarStyles = (car: DaishaMaster) => {
    const baseDate = new Date();
    let backgroundColor = "#ffffff";
    let textColor = "#1e293b";

    const inspectDate = car.inspection_date
      ? new Date(car.inspection_date)
      : null;
    const diffInspectDays = inspectDate
      ? differenceInDays(inspectDate, baseDate)
      : 999;

    const oilDate = car.last_oil_change_date
      ? new Date(car.last_oil_change_date)
      : null;
    const diffOilDays = oilDate ? differenceInDays(baseDate, oilDate) : 0;

    if (diffInspectDays >= 0 && diffInspectDays <= 30) {
      backgroundColor = "#fee2e2";
      textColor = "#dc2626";
    } else if (car.car_name.includes("プリウス") || diffOilDays > 180) {
      backgroundColor = "#f3e8ff";
      textColor = "#7c3aed";
    }

    return { backgroundColor, color: textColor };
  };

  const getAvailableSafeCars = () => {
    const start = new Date(formDataStart);
    const end = new Date(formDataEnd);

    let available = cars.filter((car) => {
      if (formSizeType !== "限定なし" && car.size_type !== formSizeType)
        return false;
      return car.status === "貸出可";
    });
    available = available.filter((car) => {
      const hasConflict = confirmedReservations.some((res) => {
        if (res.car_id !== car.id) return false;
        const resStart = parseISO(res.start_at);
        const resEnd = parseISO(res.end_at);
        return isBefore(resStart, end) && isAfter(resEnd, start);
      });
      return !hasConflict;
    });
    return available.sort((a, b) => {
      const dateA = a.inspection_date
        ? new Date(a.inspection_date).getTime()
        : 0;
      const dateB = b.inspection_date
        ? new Date(b.inspection_date).getTime()
        : 0;
      return dateB - dateA;
    });
  };

  const handleRegisterSubmit = async () => {
    if (!formCustomerName || !formStaffName) {
      alert("顧客名と自社担当者は必須入力です。");
      return;
    }

    try {
      const { error } = await supabase.from("daisha_reservations").insert([
        {
          car_id: formSelectedCarId,
          start_at: new Date(formDataStart).toISOString(),
          end_at: new Date(formDataEnd).toISOString(),
          customer_name: formCustomerName,
          car_type: formCarType,
          purpose: formPurpose,
          staff_name: formStaffName,
          status: formSelectedCarId ? "確定" : "保留",
          note: formNote || null,
          size_limit: formSizeType,
        },
      ]);

      if (error) {
        if (
          error.code === "23P01" ||
          error.message?.includes("prevent_overlapping_reservations")
        ) {
          alert(
            "選択された車両・時間帯には、既に他の予約が入っています。時間を変更するか別の車両を選択してください。",
          );
          return;
        }
        throw error;
      }

      alert("予約が完了しました。");
      setIsModalOpen(false);
      setRegisterStep(1);
      setFormCustomerName("");
      setFormCarType("");
      setFormStaffName("");
      setFormNote("");
      setFormSelectedCarId(null);
      setFormSizeType("限定なし");

      await fetchData();
    } catch (err) {
      console.error("予約の登録に失敗しました:", err);
      alert("登録処理中にエラーが発生しました。");
    }
  };

  const handleUpdateReservation = async () => {
    if (!selectedReservation) return;
    if (!editCustomerName || !editStaffName) {
      alert("顧客名と自社担当者は必須入力です。");
      return;
    }

    let targetCarId = selectedReservation.car_id;
    let targetStatus = selectedReservation.status;
    let showWarning = false;

    if (targetCarId) {
      const currentCar = cars.find((c) => c.id === targetCarId);
      if (currentCar) {
        if (
          (editSizeType === "軽自動車" &&
            currentCar.size_type !== "軽自動車") ||
          (editSizeType === "普通車" && currentCar.size_type !== "普通車")
        ) {
          showWarning = true;
          targetCarId = null;
          targetStatus = "保留";
        }
      }
    }

    try {
      if (showWarning) {
        alert(
          "変更後のサイズ限定条件が、現在割り当てられている車両と一致しないため、この予約を【保留エリア】へ移動しました。再度カレンダー上で適切な車両へ配置してください。",
        );
      }

      const { error } = await supabase
        .from("daisha_reservations")
        .update({
          customer_name: editCustomerName,
          car_type: editCarType,
          purpose: editPurpose,
          staff_name: editStaffName,
          note: editNote || null,
          size_limit: editSizeType,
          car_id: targetCarId,
          status: targetStatus,
        })
        .eq("id", selectedReservation.id);

      if (error) throw error;

      setIsEditMode(false);
      setIsDetailModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error("予約の更新に失敗しました:", err);
      alert("更新に失敗しました。");
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm("この予約をキャンセル（削除）してよろしいですか？"))
      return;
    try {
      const { error } = await supabase
        .from("daisha_reservations")
        .update({ status: "キャンセル" })
        .eq("id", id);
      if (error) throw error;
      setIsDetailModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error("予約のキャンセルに失敗しました:", err);
    }
  };

  const openDetailModal = (res: DaishaReservation) => {
    setSelectedReservation(res);
    setEditCustomerName(res.customer_name);
    setEditCarType(res.car_type || "");
    setEditPurpose(res.purpose);
    setEditStaffName(res.staff_name);
    setEditNote(res.note || "");
    setEditSizeType(res.size_limit || "限定なし");
    setIsEditMode(false);
    setIsDetailModalOpen(true);
  };

  // ─── 代車マスタ (CRUD) 操作ハンドラ ───
  const openAddCarModal = () => {
    setEditingCar(null);
    setCarFormName("");
    setCarFormNumber("");
    setCarFormColor("");
    setCarFormSize("軽自動車");
    setCarFormStatus("貸出可");
    setCarFormInspection("");
    setCarFormOil("");
    setCarFormEtc(false);
    setCarFormNote("");
    setIsCarModalOpen(true);
  };

  const openEditCarModal = (car: DaishaMaster) => {
    setEditingCar(car);
    setCarFormName(car.car_name);
    setCarFormNumber(car.number_plate);
    setCarFormColor(car.body_color);
    setCarFormSize(car.size_type);
    setCarFormStatus(car.status as "貸出可" | "貸出不可");
    setCarFormInspection(car.inspection_date || "");
    setCarFormOil(car.last_oil_change_date || "");
    setCarFormEtc(car.has_etc);
    setCarFormNote(car.note || "");
    setIsCarModalOpen(true);
  };

  const handleSaveCar = async () => {
    if (!carFormName || !carFormNumber) {
      alert("車名とナンバープレートは必須項目です。");
      return;
    }

    // ★ 車検満了日・最終オイル交換日の未入力バリデーション
    if (!carFormInspection && !carFormOil) {
      alert("車検満了日と最終オイル交換日を入力してください。");
      return;
    }
    if (!carFormInspection) {
      alert("車検満了日を入力してください。");
      return;
    }
    if (!carFormOil) {
      alert("最終オイル交換日を入力してください。");
      return;
    }

    try {
      const carData = {
        car_name: carFormName,
        number_plate: carFormNumber,
        body_color: carFormColor,
        size_type: carFormSize,
        status: carFormStatus,
        inspection_date: carFormInspection || null,
        last_oil_change_date: carFormOil || null,
        has_etc: carFormEtc,
        note: carFormNote || null,
      };

      if (editingCar) {
        const { error } = await supabase
          .from("daisha_masters")
          .update(carData)
          .eq("id", editingCar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daisha_masters")
          .insert([carData]);
        if (error) throw error;
      }

      setIsCarModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("代車情報の保存に失敗しました:", {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        fullError: err,
      });

      alert("保存に失敗しました。");
    }
  };

  const handleDeleteCar = async (carId: string) => {
    const todayStart = startOfDay(new Date());

    const hasFutureReservation = reservations.some((r) => {
      if (r.car_id !== carId || r.status !== "確定") return false;
      const resEnd = parseISO(r.end_at);
      return isAfter(resEnd, todayStart);
    });

    if (hasFutureReservation) {
      alert(
        "今日以降に予約が入っているため、この代車を削除（非稼働化）することはできません。\nカレンダーから予約を変更またはキャンセルした後に再度お試しください。",
      );
      return;
    }

    if (
      !window.confirm(
        "この代車を削除（非稼働化）してよろしいですか？\n※過去の履歴データは保持されます。",
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("daisha_masters")
        .update({ status: "非稼働" })
        .eq("id", carId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error("代車の削除に失敗しました:", err);
      alert("削除に失敗しました。");
    }
  };

  // ─── 予約バー描画 (PC用) ───
  const renderReservationBars = (carId: string) => {
    const carRes = confirmedReservations.filter((r) => r.car_id === carId);
    const oneDayWidthPercent = 100 / daysCount;

    return carRes.map((res) => {
      const isCurrentlyResizingThis = resizingResId === res.id;

      const resStart = startOfDay(parseISO(res.start_at));
      let resEnd = endOfDay(parseISO(res.end_at));

      if (isCurrentlyResizingThis && resizingCurrentTargetDate) {
        const potentialEnd = endOfDay(resizingCurrentTargetDate);
        if (!isBefore(potentialEnd, resStart)) {
          resEnd = potentialEnd;
        }
      }

      if (isAfter(resStart, timelineEnd) || isBefore(resEnd, timelineStart))
        return null;

      let startOffsetDays = differenceInDays(resStart, timelineStart);
      if (startOffsetDays < 0) startOffsetDays = 0;

      const displayStart = isBefore(resStart, timelineStart)
        ? timelineStart
        : resStart;
      const displayEnd = isAfter(resEnd, timelineEnd) ? timelineEnd : resEnd;
      const durationDays = differenceInDays(displayEnd, displayStart) + 1;

      const leftPercent = startOffsetDays * oneDayWidthPercent;
      const widthPercent = durationDays * oneDayWidthPercent;

      const isHovered = hoveredResId === res.id;
      const isRepeat =
        res.purpose.includes("修理") || res.customer_name.includes("山田商事");
      const barColor = isRepeat ? "#0d9488" : "#3b82f6";
      const shadowColor = isHovered
        ? isRepeat
          ? "rgba(13,148,136,0.4)"
          : "rgba(59,130,246,0.4)"
        : isRepeat
          ? "rgba(13,148,136,0.15)"
          : "rgba(59,130,246,0.15)";
      const periodText = `${format(parseISO(res.start_at), "M/d H:mm")}～${format(
        parseISO(res.end_at),
        "M/d H:mm",
      )}`;

      const carTypeStr = res.car_type || "車種未入力";
      const line1Text = `${res.customer_name} 様 [${carTypeStr} ${res.purpose}/${res.staff_name}]`;
      const line2Text = res.note ? `${periodText} ${res.note}` : periodText;

      const currentCar = cars.find((c) => c.id === carId);
      const displayBadgeType = res.size_limit || currentCar?.size_type;

      return (
        <div
          key={res.id}
          draggable={resizingResId === null}
          onDragStart={(e) => handleDragStart(e, res.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => {
            e.stopPropagation();
            handleGridCellDrop(e, carId);
          }}
          onMouseEnter={() => setHoveredResId(res.id)}
          onMouseLeave={() => setHoveredResId(null)}
          onClick={(e) => {
            e.stopPropagation();
            if (isDraggingOrResizing.current) return;
            openDetailModal(res);
          }}
          style={{
            position: "absolute",
            left: `${leftPercent}%`,
            width: isHovered ? "auto" : `calc(${widthPercent}% - 4px)`,
            minWidth: isHovered ? `calc(${widthPercent}% - 4px)` : "auto",
            marginLeft: "2px",
            top: "18px",
            height: isHovered ? "62px" : "54px",
            backgroundColor: barColor,
            opacity: isCurrentlyResizingThis ? 0.8 : 1,
            color: "#fff",
            borderRadius: "6px",
            padding: "4px 10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "500",
            boxShadow: isHovered
              ? `0 8px 16px ${shadowColor}`
              : `0 2px 5px ${shadowColor}`,
            overflow: isHovered ? "visible" : "hidden",
            whiteSpace: "nowrap",
            cursor: resizingResId ? "ew-resize" : "grab",
            zIndex: isHovered || isCurrentlyResizingThis ? 60 : 20,
            lineHeight: "1.4",
            textAlign: "left",
            alignItems: "flex-start",
            transition: isCurrentlyResizingThis
              ? "none"
              : "height 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out",
            transform:
              isHovered && !isCurrentlyResizingThis
                ? "scale(1.01) translateY(-2px)"
                : "scale(1) translateY(0)",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              textAlign: "left",
              fontWeight: "bold",
              overflow: isHovered ? "visible" : "hidden",
              textOverflow: isHovered ? "unset" : "ellipsis",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {line1Text}
          </div>

          <div
            style={{
              width: "100%",
              textAlign: "left",
              fontSize: "10px",
              opacity: 0.9,
              overflow: isHovered ? "visible" : "hidden",
              textOverflow: isHovered ? "unset" : "ellipsis",
              whiteSpace: "nowrap",
              marginTop: "2px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              pointerEvents: "none",
            }}
          >
            {displayBadgeType && displayBadgeType !== "限定なし" && (
              <span
                style={{
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  fontSize: "9px",
                  padding: "1px 5px",
                  borderRadius: "3px",
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
              >
                {displayBadgeType === "軽自動車" ? "軽限定" : "普通車限定"}
              </span>
            )}
            <span>{line2Text}</span>
          </div>

          {/* ★ 右端の伸縮ハンドル */}
          <div
            draggable={false}
            onMouseDown={(e) => handleResizeMouseDown(e, res.id)}
            onClick={(e) => e.stopPropagation()}
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "14px",
              cursor: "ew-resize",
              zIndex: 30,
              pointerEvents: "auto",
              backgroundColor:
                isHovered || isCurrentlyResizingThis
                  ? "rgba(255,255,255,0.35)"
                  : "transparent",
              borderRadius: "0 6px 6px 0",
              borderLeft:
                isHovered || isCurrentlyResizingThis
                  ? "1px dashed rgba(255,255,255,0.6)"
                  : "none",
            }}
          />
        </div>
      );
    });
  };

  // ★ 検索フィルタリング（車名・ナンバー・お客様名）
  const filteredCars = cars.filter((car) => {
    if (!filterText.trim()) return true;
    const keyword = filterText.toLowerCase().trim();

    // 1. 車名・ナンバープレートに含まれるか
    const carMatch = `${car.car_name} ${car.number_plate}`
      .toLowerCase()
      .includes(keyword);

    // 2. その車両に紐づく確定予約の顧客名（customer_name）に含まれるか
    const customerMatch = confirmedReservations.some(
      (res) =>
        res.car_id === car.id &&
        res.customer_name.toLowerCase().includes(keyword),
    );

    return carMatch || customerMatch;
  });

  const availableSafeCars = getAvailableSafeCars();
  const selectedCarInfo = selectedReservation
    ? cars.find((c) => c.id === selectedReservation.car_id)
    : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily:
          '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* ─── サイドメニュー ─── */}
      <aside
        style={{
          width: isMobile ? "100%" : "240px",
          minWidth: isMobile ? "100%" : "240px",
          backgroundColor: "#fff",
          borderRight: isMobile ? "none" : "1px solid #e2e8f0",
          borderBottom: isMobile ? "1px solid #e2e8f0" : "none",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          flexWrap: isMobile ? "wrap" : "nowrap",
          justifyContent: isMobile ? "space-between" : "flex-start",
          alignItems: isMobile ? "center" : "stretch",
          padding: isMobile ? "8px 16px" : "0",
          zIndex: 50,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            padding: isMobile ? "0" : "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: isMobile ? "none" : "1px solid #f1f5f9",
          }}
        >
          <span
            style={{
              fontSize: isMobile ? "14px" : "16px",
              fontWeight: "bold",
              color: "#0f172a",
              whiteSpace: "nowrap",
            }}
          >
            代車管理システム
          </span>
        </div>
        <nav
          style={{
            flex: isMobile ? "none" : 1,
            padding: isMobile ? "0" : "16px",
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            gap: isMobile ? "4px" : "6px",
            overflowX: isMobile ? "auto" : "visible",
          }}
        >
          <button
            onClick={() => setActiveTab("calendar")}
            style={{
              padding: isMobile ? "6px 10px" : "12px 16px",
              borderRadius: "8px",
              backgroundColor:
                activeTab === "calendar" ? "#eff6ff" : "transparent",
              color: activeTab === "calendar" ? "#2563eb" : "#475569",
              fontWeight: activeTab === "calendar" ? "bold" : "500",
              border: "none",
              textAlign: "left",
              fontSize: isMobile ? "12px" : "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "4px" : "10px",
              whiteSpace: "nowrap",
            }}
          >
            <Calendar size={isMobile ? 16 : 18} />
            <span>カレンダー</span>
          </button>

          <button
            onClick={() => setActiveTab("tomorrow")}
            style={{
              padding: isMobile ? "6px 10px" : "12px 16px",
              borderRadius: "8px",
              backgroundColor:
                activeTab === "tomorrow" ? "#eff6ff" : "transparent",
              color: activeTab === "tomorrow" ? "#2563eb" : "#475569",
              fontWeight: activeTab === "tomorrow" ? "bold" : "500",
              border: "none",
              textAlign: "left",
              fontSize: isMobile ? "12px" : "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "4px" : "10px",
              whiteSpace: "nowrap",
            }}
          >
            <CalendarDays size={isMobile ? 16 : 18} />
            <span>明日貸出予定</span>
          </button>

          <button
            onClick={() => setActiveTab("cars")}
            style={{
              padding: isMobile ? "6px 10px" : "12px 16px",
              borderRadius: "8px",
              backgroundColor: activeTab === "cars" ? "#eff6ff" : "transparent",
              color: activeTab === "cars" ? "#2563eb" : "#475569",
              fontWeight: activeTab === "cars" ? "bold" : "500",
              border: "none",
              textAlign: "left",
              fontSize: isMobile ? "12px" : "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "4px" : "10px",
              whiteSpace: "nowrap",
            }}
          >
            <Car size={isMobile ? 16 : 18} />
            <span>代車一覧</span>
          </button>
        </nav>

        {!isMobile && activeTab === "calendar" && (
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              onClick={() => {
                const now = new Date();
                setFormDataStart(getInitialDateTimeString(now, 9));
                setFormDataEnd(getInitialDateTimeString(now, 18));

                setIsModalOpen(true);
                setRegisterStep(1);
                setFormSizeType("限定なし");
              }}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#1e3a8a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(30,58,138,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={18} />
              <span>新規予約登録</span>
            </button>
          </div>
        )}
      </aside>

      {/* ─── メインエリア ─── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#f8fafc",
        }}
      >
        <header
          style={{
            height: isMobile ? "auto" : "60px",
            backgroundColor: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            padding: isMobile ? "12px 16px" : "0 24px",
            gap: isMobile ? "8px" : "0",
          }}
        >
          <span
            style={{
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: "bold",
              color: "#1e293b",
            }}
          >
            {activeTab === "calendar"
              ? "代車貸出状況"
              : activeTab === "cars"
                ? "代車マスター管理"
                : "明日貸出予定一覧"}
          </span>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="text"
                placeholder="車名・ナンバー・お客様名で検索"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{
                  width: "260px",
                  padding: "6px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              />
            </div>
          )}
        </header>

        {/* ─── タブ1：カレンダー画面 ─── */}
        {activeTab === "calendar" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              overflow: "hidden",
            }}
          >
            {/* 保留エリア (PC版のみ表示・SP版では非表示) */}
            {!isMobile && (
              <section
                style={{
                  width: "220px",
                  minWidth: "220px",
                  backgroundColor: "#fff",
                  borderRight: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#334155",
                  }}
                >
                  保留エリア
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: "normal",
                      marginLeft: "4px",
                    }}
                  >
                    (ドラッグして配置)
                  </span>
                </h3>
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {pendingReservations.length === 0 ? (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "12px",
                        width: "100%",
                      }}
                    >
                      保留中の予約はありません
                    </div>
                  ) : (
                    pendingReservations.map((res) => (
                      <div
                        key={res.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, res.id)}
                        onClick={() => openDetailModal(res)}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "12px",
                          backgroundColor: "#fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          cursor: "grab",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: "#1e293b",
                            }}
                          >
                            {res.customer_name} 様
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: res.purpose.includes("車検")
                                ? "#eff6ff"
                                : "#f0fdf4",
                              color: res.purpose.includes("車検")
                                ? "#3b82f6"
                                : "#16a34a",
                              fontWeight: "bold",
                            }}
                          >
                            {res.purpose.includes("車検") ? "新規" : "リピート"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                            fontSize: "12px",
                            color: "#475569",
                            borderTop: "1px dashed #f1f5f9",
                            paddingTop: "6px",
                            marginBottom: "6px",
                          }}
                        >
                          <div>
                            <span style={{ color: "#94a3b8" }}>預かり車種:</span>{" "}
                            {res.car_type}
                          </div>
                          <div>
                            <span style={{ color: "#94a3b8" }}>用件・目的:</span>{" "}
                            {res.purpose}
                          </div>
                          <div>
                            <span style={{ color: "#94a3b8" }}>自社担当者:</span>{" "}
                            {res.staff_name}
                          </div>
                          {res.note && (
                            <div
                              style={{
                                color: "#64748b",
                                fontStyle: "italic",
                                backgroundColor: "#f8fafc",
                                padding: "4px 6px",
                                borderRadius: "4px",
                                marginTop: "2px",
                              }}
                            >
                              備考: {res.note}
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            textAlign: "right",
                            borderTop: "1px solid #f8fafc",
                            paddingTop: "4px",
                          }}
                        >
                          {format(parseISO(res.start_at), "MM/dd HH:mm")} ～{" "}
                          {format(parseISO(res.end_at), "MM/dd HH:mm")}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragEnter={() => setIsDragOverPending(true)}
                  onDragLeave={() => setIsDragOverPending(false)}
                  onDrop={handleDropOnPendingZone}
                  style={{
                    marginTop: "12px",
                    border: isDragOverPending
                      ? "2px dashed #2563eb"
                      : "2px dashed #cbd5e1",
                    borderRadius: "8px",
                    padding: "14px",
                    textAlign: "center",
                    color: isDragOverPending ? "#2563eb" : "#64748b",
                    fontSize: "12px",
                    backgroundColor: isDragOverPending ? "#eff6ff" : "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "copy",
                    transition: "all 0.15s ease-in-out",
                    fontWeight: isDragOverPending ? "bold" : "normal",
                    transform: isDragOverPending ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <span style={{ pointerEvents: "none" }}>
                    ここにドラッグして
                  </span>
                  <span style={{ pointerEvents: "none" }}>保留リストに追加</span>
                </div>
              </section>
            )}

            {/* メインビュー（SP: アコーディオン一覧 / PC: タイムライン） */}
            <section
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: isMobile ? "12px" : "20px",
              }}
            >
              {isMobile ? (
                /* 【SP用表示】アコーディオン一覧 ＋ 上部検索バー */
                <div style={{ flex: 1, overflowY: "auto", paddingRight: "2px" }}>
                  {/* 常時配置の検索欄 (インクリメンタル検索 + クリアボタン) */}
                  <div style={{ position: "relative", marginBottom: "12px" }}>
                    <Search
                      size={16}
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="車名・ナンバー・お客様名で検索"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 32px 8px 32px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                    {filterText && (
                      <button
                        onClick={() => setFilterText("")}
                        style={{
                          position: "absolute",
                          right: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* アコーディオン一覧 */}
                  {filteredCars.length === 0 ? (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      該当する車両がありません
                    </div>
                  ) : (
                    filteredCars.map((car) => {
                      const carReservations = confirmedReservations.filter(
                        (r) => r.car_id === car.id,
                      );
                      const keyword = filterText.toLowerCase().trim();
                      const isCustomerMatch =
                        keyword !== "" &&
                        carReservations.some((res) =>
                          res.customer_name.toLowerCase().includes(keyword),
                        );
                      // お客様名検索時は該当アコーディオンを自動展開
                      const isExpanded =
                        expandedCarIds[car.id] ?? isCustomerMatch;

                      return (
                        <CarAccordionItem
                          key={car.id}
                          car={car}
                          reservations={carReservations}
                          isExpanded={isExpanded}
                          onToggle={() => toggleCarAccordion(car.id)}
                          onSelectReservation={(res) => openDetailModal(res)}
                        />
                      );
                    })
                  )}
                </div>
              ) : (
                /* 【PC用表示】既存のカレンダー表示 */
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <button
                        onClick={() => setCurrentStartDate(new Date())}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#fff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        今日
                      </button>
                      <button
                        onClick={() =>
                          setCurrentStartDate(addDays(currentStartDate, -7))
                        }
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#fff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        &lt;
                      </button>
                      <button
                        onClick={() =>
                          setCurrentStartDate(addDays(currentStartDate, 7))
                        }
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#fff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        &gt;
                      </button>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "bold",
                          marginLeft: "8px",
                          color: "#1e293b",
                        }}
                      >
                        {format(daysArray[0], "yyyy年M月d日")} ～{" "}
                        {format(daysArray[daysCount - 1], "M月d日")}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        backgroundColor: "#e2e8f0",
                        padding: "2px",
                        borderRadius: "6px",
                      }}
                    >
                      {(["日", "週", "2週間", "月"] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => setCurrentView(view)}
                          style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor:
                              currentView === view ? "#1e3a8a" : "transparent",
                            color: currentView === view ? "#fff" : "#475569",
                            fontWeight: currentView === view ? "bold" : "normal",
                            cursor: "pointer",
                          }}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* カレンダー本体 */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        borderBottom: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                        height: "50px",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          minWidth: "220px",
                          borderRight: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: "16px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#64748b",
                        }}
                      >
                        車両
                      </div>
                      <div style={{ flex: 1, display: "flex" }}>
                        {daysArray.map((day, idx) => {
                          const dayOfWeek = format(day, "E");
                          const isSat = dayOfWeek === "土" || dayOfWeek === "Sat";
                          const isSun = dayOfWeek === "日" || dayOfWeek === "Sun";
                          const dayColor = isSat
                            ? "#2563eb"
                            : isSun
                              ? "#dc2626"
                              : "#1e293b";
                          return (
                            <div
                              key={idx}
                              onClick={() => setCurrentStartDate(day)}
                              style={{
                                flex: 1,
                                borderRight:
                                  idx < daysCount - 1
                                    ? "1px solid #e2e8f0"
                                    : "none",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f1f5f9")
                              }
                              onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                              }
                            >
                              <span style={{ fontSize: "11px", color: "#64748b" }}>
                                {format(day, "E", { locale: ja })}
                              </span>
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  color: dayColor,
                                }}
                              >
                                {format(day, "d")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto" }}>
                      {loading ? (
                        <div style={{ padding: "40px", textAlign: "center" }}>
                          データを読み込み中...
                        </div>
                      ) : (
                        filteredCars.map((car) => {
                          const carStyle = getCarStyles(car);
                          return (
                            <div
                              key={car.id}
                              style={{
                                display: "flex",
                                borderBottom: "1px solid #f1f5f9",
                                minHeight: "95px",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  width: "220px",
                                  minWidth: "220px",
                                  borderRight: "1px solid #e2e8f0",
                                  padding: "12px",
                                  transition: "background-color 0.2s",
                                  ...carStyle,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  zIndex: 10,
                                }}
                              >
                                <div
                                  style={{ fontSize: "14px", fontWeight: "bold" }}
                                >
                                  {car.car_name}{" "}
                                  <span style={{ opacity: 0.8 }}>
                                    ({car.number_plate})
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    opacity: 0.9,
                                    marginTop: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span>{car.body_color}</span>
                                  <span>|</span>
                                  {car.has_etc && (
                                    <span
                                      style={{
                                        backgroundColor: "#10b981",
                                        color: "#fff",
                                        fontSize: "9px",
                                        padding: "1px 4px",
                                        borderRadius: "3px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      ETC
                                    </span>
                                  )}
                                  <span>|</span>
                                  <span
                                    style={{ fontSize: "10px", fontWeight: "500" }}
                                  >
                                    検:{" "}
                                    {car.inspection_date
                                      ? format(
                                        new Date(car.inspection_date),
                                        "yy/MM/dd",
                                      )
                                      : "未登録"}
                                  </span>
                                </div>
                              </div>

                              <div
                                ref={calendarGridRef}
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  position: "relative",
                                }}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleGridCellDrop(e, car.id)}
                              >
                                {daysArray.map((_, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      flex: 1,
                                      borderRight:
                                        idx < daysCount - 1
                                          ? "1px solid #f1f5f9"
                                          : "none",
                                      height: "100%",
                                      transition: "background-color 0.15s",
                                      position: "relative",
                                      zIndex: 1,
                                    }}
                                  />
                                ))}
                                {renderReservationBars(car.id)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* ─── タブ2：代車一覧画面 (CRUD) ─── */}
        {activeTab === "cars" && (
          <div
            style={{
              flex: 1,
              padding: isMobile ? "12px" : "24px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "center",
                gap: isMobile ? "12px" : "0",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  保有代車一覧
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    margin: "4px 0 0 0",
                  }}
                >
                  登録済みの車両データの確認・追加・編集・削除が行えます。
                </p>
              </div>
              <button
                onClick={openAddCarModal}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>＋</span> 代車を追加
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {filteredCars.map((car) => (
                <div
                  key={car.id}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "18px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color:
                              car.size_type === "軽自動車"
                                ? "#0284c7"
                                : "#0d9488",
                            backgroundColor:
                              car.size_type === "軽自動車"
                                ? "#e0f2fe"
                                : "#ccfbf1",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            marginRight: "6px",
                          }}
                        >
                          {car.size_type}
                        </span>
                        {car.has_etc && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "bold",
                              color: "#059669",
                              backgroundColor: "#d1fae5",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            ETC装備
                          </span>
                        )}
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#1e293b",
                            margin: "8px 0 2px 0",
                          }}
                        >
                          {car.car_name}
                        </h3>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#64748b",
                          }}
                        >
                          {car.number_plate}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          backgroundColor:
                            car.status === "貸出可" ? "#dcfce7" : "#fee2e2",
                          color:
                            car.status === "貸出可" ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {car.status}
                      </span>
                    </div>

                    <div
                      style={{
                        borderTop: "1px dashed #f1f5f9",
                        paddingTop: "12px",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        fontSize: "12px",
                        color: "#475569",
                      }}
                    >
                      <div>
                        <span style={{ color: "#94a3b8" }}>ボディカラー:</span>{" "}
                        {car.body_color || "未登録"}
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8" }}>車検満了日:</span>{" "}
                        {car.inspection_date
                          ? format(new Date(car.inspection_date), "yyyy/MM/dd")
                          : "未登録"}
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <span style={{ color: "#94a3b8" }}>
                          最終オイル交換日:
                        </span>{" "}
                        {car.last_oil_change_date
                          ? format(
                            new Date(car.last_oil_change_date),
                            "yyyy/MM/dd",
                          )
                          : "未登録"}
                      </div>
                      <div style={{ gridColumn: "span 2", marginTop: "4px" }}>
                        <span
                          style={{
                            color: "#94a3b8",
                            display: "block",
                            marginBottom: "2px",
                          }}
                        >
                          備考:
                        </span>
                        <div
                          style={{
                            backgroundColor: "#f8fafc",
                            padding: "6px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            color: car.note ? "#334155" : "#94a3b8",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {car.note || "なし"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      marginTop: "16px",
                      paddingTop: "12px",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => openEditCarModal(car)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteCar(car.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#fff1f2",
                        color: "#e11d48",
                        border: "1px solid #fecdd3",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── タブ3：明日貸出予定一覧 ─── */}
        {activeTab === "tomorrow" && <TomorrowRentalList />}
      </div>

      {/* ─── SP用 フローティング・アクション・ボタン (FAB) ─── */}
      {isMobile && (
        <button
          onClick={() => {
            const now = new Date();
            setFormDataStart(getInitialDateTimeString(now, 9));
            setFormDataEnd(getInitialDateTimeString(now, 18));
            setIsModalOpen(true);
            setRegisterStep(1);
            setFormSizeType("限定なし");
          }}
          style={{
            position: "fixed",
            bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
            right: "16px",
            width: "56px",
            height: "56px",
            borderRadius: "28px",
            backgroundColor: "#1e3a8a",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 90,
          }}
          aria-label="新規予約"
        >
          <Plus size={28} />
        </button>
      )}

      {/* ─── 新規予約登録モーダル ─── */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",

            // ★ iOS Safariの下部ツールバーを考慮
            height: isMobile ? "100dvh" : "100vh",

            backgroundColor: "rgba(15,23,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,

            // ★ SPでは下側の余白を大きくしてモーダルを上方向へ移動
            padding: isMobile
              ? "12px 12px calc(64px + env(safe-area-inset-bottom, 0px))"
              : "0",

            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              width: isMobile ? "100%" : "580px",
              maxHeight: isMobile
                ? "calc(100dvh - 100px - env(safe-area-inset-bottom, 0px))"
                : "90vh",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                backgroundColor: "#1e3a8a",
                padding: "18px 24px",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                新規予約の登録
              </span>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setRegisterStep(1);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: "22px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                padding: "12px 24px",
                gap: "8px",
              }}
            >
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor:
                        registerStep === step
                          ? "#1e3a8a"
                          : registerStep > step
                            ? "#10b981"
                            : "#cbd5e1",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {registerStep > step ? "" : step}
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: registerStep === step ? "bold" : "normal",
                      color: registerStep === step ? "#1e3a8a" : "#64748b",
                    }}
                  >
                    {step === 1
                      ? "期間・サイズ選択"
                      : step === 2
                        ? "貸出車両の選択"
                        : "顧客情報の入力"}
                  </span>
                  {step < 3 && (
                    <div
                      style={{
                        flex: 1,
                        height: "2px",
                        backgroundColor:
                          registerStep > step ? "#10b981" : "#e2e8f0",
                        marginLeft: "4px",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                padding: isMobile ? "20px" : "24px",
                minHeight: "280px",
                maxHeight: "60vh",

                // ★ 縦方向のみスクロール
                overflowY: "auto",
                overflowX: "hidden",

                // ★ SPで左右方向のスワイプ・揺れを抑制
                width: "100%",
                boxSizing: "border-box",
                touchAction: "pan-y",
                overscrollBehaviorX: "none",
              }}
            >
              {registerStep === 1 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflowX: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "16px",
                      minWidth: 0,
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#334155",
                          marginBottom: "6px",
                        }}
                      >
                        貸出開始日時 *
                      </label>
                      <input
                        type="datetime-local"
                        value={formDataStart}
                        onChange={(e) => handleStartChange(e.target.value)}
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          minWidth: 0,
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#334155",
                          marginBottom: "6px",
                        }}
                      >
                        返却予定日時 *
                      </label>
                      <input
                        type="datetime-local"
                        value={formDataEnd}
                        onChange={(e) => setFormDataEnd(e.target.value)}
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          minWidth: 0,
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      車両サイズ区分
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        gap: "12px",
                      }}
                    >
                      {(["限定なし", "軽自動車", "普通車"] as const).map(
                        (size) => (
                          <label
                            key={size}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              padding: "12px",
                              border:
                                formSizeType === size
                                  ? "2px solid #1e3a8a"
                                  : "1px solid #cbd5e1",
                              borderRadius: "8px",
                              backgroundColor:
                                formSizeType === size ? "#f0f4ff" : "#fff",
                              cursor: "pointer",
                              fontWeight:
                                formSizeType === size ? "bold" : "normal",
                              color:
                                formSizeType === size ? "#1e3a8a" : "#334155",
                            }}
                          >
                            <input
                              type="radio"
                              name="size_type"
                              checked={formSizeType === size}
                              onChange={() => setFormSizeType(size)}
                              style={{ accentColor: "#1e3a8a" }}
                            />
                            {size}
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {registerStep === 2 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    安全順・空車車両リスト{" "}
                    {formSizeType !== "限定なし" && `(${formSizeType}限定)`}
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        border:
                          formSelectedCarId === null
                            ? "2px solid #475569"
                            : "1px solid #cbd5e1",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor:
                          formSelectedCarId === null ? "#f8fafc" : "#fff",
                      }}
                    >
                      <input
                        type="radio"
                        name="selected_car"
                        checked={formSelectedCarId === null}
                        onChange={() => setFormSelectedCarId(null)}
                      />
                      <div>
                        <span style={{ fontWeight: "bold", color: "#334155" }}>
                          車両を割り当てずに保留リストへ登録
                        </span>
                      </div>
                    </label>
                    {availableSafeCars.map((car) => (
                      <label
                        key={car.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          border:
                            formSelectedCarId === car.id
                              ? "2px solid #1e3a8a"
                              : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor:
                            formSelectedCarId === car.id ? "#f0f4ff" : "#fff",
                        }}
                      >
                        <input
                          type="radio"
                          name="selected_car"
                          checked={formSelectedCarId === car.id}
                          onChange={() => setFormSelectedCarId(car.id)}
                        />
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <span
                              style={{ fontWeight: "bold", marginRight: "8px" }}
                            >
                              {car.car_name}
                            </span>
                            <span
                              style={{ fontSize: "12px", color: "#64748b" }}
                            >
                              ({car.number_plate}) - {car.body_color}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: "#e2e8f0",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: "500",
                            }}
                          >
                            検:{" "}
                            {car.inspection_date
                              ? format(
                                new Date(car.inspection_date),
                                "yy/MM/dd",
                              )
                              : "未設定"}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {registerStep === 3 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#334155",
                          marginBottom: "4px",
                        }}
                      >
                        顧客名 *
                      </label>
                      <input
                        type="text"
                        placeholder=""
                        value={formCustomerName}
                        onChange={(e) => setFormCustomerName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#334155",
                          marginBottom: "4px",
                        }}
                      >
                        自社担当者 *
                      </label>
                      <input
                        type="text"
                        placeholder=""
                        value={formStaffName}
                        onChange={(e) => setFormStaffName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#334155",
                          marginBottom: "4px",
                        }}
                      >
                        預かり車種名
                      </label>
                      <input
                        type="text"
                        placeholder=""
                        value={formCarType}
                        onChange={(e) => setFormCarType(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#334155",
                          marginBottom: "4px",
                        }}
                      >
                        用件・目的
                      </label>
                      <select
                        value={formPurpose}
                        onChange={(e) => setFormPurpose(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <option value="車検">車検</option>
                        <option value="修理・整備">修理・整備</option>
                        <option value="先取り">先取り</option>
                        <option value="その他">その他</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#334155",
                        marginBottom: "4px",
                      }}
                    >
                      備考
                    </label>
                    <textarea
                      placeholder="特記事項があれば記入"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        height: "60px",
                        resize: "none",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#f8fafc",
              }}
            >
              <button
                onClick={() => {
                  if (registerStep === 1) setIsModalOpen(false);
                  else setRegisterStep((prev) => (prev - 1) as 1 | 2 | 3);
                }}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#fff",
                  color: "#475569",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                {registerStep === 1 ? "キャンセル" : "戻る"}
              </button>
              <button
                onClick={() => {
                  if (registerStep < 3)
                    setRegisterStep((prev) => (prev + 1) as 1 | 2 | 3);
                  else handleRegisterSubmit();
                }}
                style={{
                  padding: "8px 20px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#1e3a8a",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {registerStep === 3 ? "この内容で確定する" : "次へ進む"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 予約詳細確認・編集モーダル ─── */}
      {isDetailModalOpen && selectedReservation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: isMobile ? "100dvh" : "100vh",
            backgroundColor: "rgba(15,23,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 110,

            padding: isMobile
              ? "12px 12px calc(64px + env(safe-area-inset-bottom, 0px))"
              : "0",

            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              width: isMobile ? "100%" : "520px",
              maxHeight: isMobile
                ? "calc(100dvh - 100px - env(safe-area-inset-bottom, 0px))"
                : "90vh",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                backgroundColor: "#334155",
                padding: "16px 24px",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "15px", fontWeight: "bold" }}>
                予約の詳細確認
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: "22px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto" }}>
              {!isEditMode ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "2px solid #f1f5f9",
                      paddingBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#0f172a",
                      }}
                    >
                      {selectedReservation.customer_name} 様
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        backgroundColor:
                          selectedReservation.status === "確定"
                            ? "#ecfdf5"
                            : "#fff7ed",
                        color:
                          selectedReservation.status === "確定"
                            ? "#047857"
                            : "#c2410c",
                        fontWeight: "bold",
                        border: "1px solid",
                      }}
                    >
                      状態: {selectedReservation.status}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr",
                      gap: "10px 4px",
                      fontSize: "14px",
                      color: "#334155",
                    }}
                  >
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      貸出代車
                    </div>
                    <div style={{ fontWeight: "600" }}>
                      {selectedCarInfo
                        ? `${selectedCarInfo.car_name} (${selectedCarInfo.number_plate})`
                        : "未割り当て (保留中)"}
                    </div>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      利用期間
                    </div>
                    <div>
                      {format(
                        parseISO(selectedReservation.start_at),
                        "yyyy/MM/dd HH:mm",
                      )}{" "}
                      ～{" "}
                      {format(
                        parseISO(selectedReservation.end_at),
                        "yyyy/MM/dd HH:mm",
                      )}
                    </div>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      区分指定
                    </div>
                    <div>{selectedReservation.size_limit || "限定なし"}</div>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      預かり車種
                    </div>
                    <div>{selectedReservation.car_type || "未入力"}</div>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      用件・目的
                    </div>
                    <div>{selectedReservation.purpose}</div>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      自社担当者
                    </div>
                    <div>{selectedReservation.staff_name}</div>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      備考欄
                    </div>
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        minHeight: "40px",
                        fontStyle: selectedReservation.note
                          ? "normal"
                          : "italic",
                        color: selectedReservation.note ? "#334155" : "#94a3b8",
                      }}
                    >
                      {selectedReservation.note || "特記事項なし"}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#64748b",
                          marginBottom: "4px",
                        }}
                      >
                        顧客名
                      </label>
                      <input
                        type="text"
                        value={editCustomerName}
                        onChange={(e) => setEditCustomerName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#64748b",
                          marginBottom: "4px",
                        }}
                      >
                        自社担当者
                      </label>
                      <input
                        type="text"
                        value={editStaffName}
                        onChange={(e) => setEditStaffName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#64748b",
                          marginBottom: "4px",
                        }}
                      >
                        預かり車種
                      </label>
                      <input
                        type="text"
                        value={editCarType}
                        onChange={(e) => setEditCarType(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#64748b",
                          marginBottom: "4px",
                        }}
                      >
                        用件・目的
                      </label>
                      <select
                        value={editPurpose}
                        onChange={(e) => setEditPurpose(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <option value="車検">車検</option>
                        <option value="修理・整備">修理・整備</option>
                        <option value="先取り">先取り</option>
                        <option value="その他">その他</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#64748b",
                        marginBottom: "6px",
                      }}
                    >
                      車両サイズ区分
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        gap: "12px",
                      }}
                    >
                      {(["限定なし", "軽自動車", "普通車"] as const).map(
                        (size) => (
                          <label
                            key={size}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              padding: "10px",
                              border:
                                editSizeType === size
                                  ? "2px solid #334155"
                                  : "1px solid #cbd5e1",
                              borderRadius: "8px",
                              backgroundColor:
                                editSizeType === size ? "#f8fafc" : "#fff",
                              cursor: "pointer",
                              fontWeight:
                                editSizeType === size ? "bold" : "normal",
                              fontSize: "13px",
                              color: "#334155",
                            }}
                          >
                            <input
                              type="radio"
                              name="edit_size_type"
                              checked={editSizeType === size}
                              onChange={() => setEditSizeType(size)}
                              style={{ accentColor: "#334155" }}
                            />
                            {size === "限定なし"
                              ? "限定なし"
                              : size === "軽自動車"
                                ? "軽限定"
                                : "普通車限定"}
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#64748b",
                        marginBottom: "4px",
                      }}
                    >
                      備考
                    </label>
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        height: "60px",
                        resize: "none",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#f8fafc",
              }}
            >
              <div>
                {!isEditMode && (
                  <button
                    onClick={() =>
                      handleCancelReservation(selectedReservation.id)
                    }
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#fee2e2",
                      color: "#ef4444",
                      border: "1px solid #fca5a5",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    予約をキャンセル
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {isEditMode ? (
                  <>
                    <button
                      onClick={() => setIsEditMode(false)}
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#fff",
                        color: "#475569",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      戻る
                    </button>
                    <button
                      onClick={handleUpdateReservation}
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#0284c7",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      変更を保存
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#fff",
                        color: "#475569",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      閉じる
                    </button>
                    <button
                      onClick={() => setIsEditMode(true)}
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#334155",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      編集する
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 代車マスタ 追加・編集モーダル ─── */}
      {isCarModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: isMobile ? "100dvh" : "100vh",
            backgroundColor: "rgba(15,23,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 120,
            padding: isMobile
              ? "12px 12px calc(64px + env(safe-area-inset-bottom, 0px))"
              : "0",

            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              width: isMobile ? "100%" : "500px",
              maxHeight: isMobile
                ? "calc(100dvh - 100px - env(safe-area-inset-bottom, 0px))"
                : "90vh",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                backgroundColor: "#2563eb",
                padding: "16px 24px",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {editingCar ? "代車情報の編集" : "新規代車の登録"}
              </span>
              <button
                onClick={() => setIsCarModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: "22px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    車種・車両名 *
                  </label>
                  <input
                    type="text"
                    placeholder="例: N-BOX"
                    value={carFormName}
                    onChange={(e) => setCarFormName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    ナンバープレート *
                  </label>
                  <input
                    type="text"
                    placeholder="例: 岡山500あ1234"
                    value={carFormNumber}
                    onChange={(e) => setCarFormNumber(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    ボディカラー
                  </label>
                  <input
                    type="text"
                    placeholder="例: ホワイト"
                    value={carFormColor}
                    onChange={(e) => setCarFormColor(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    車両サイズ区分
                  </label>
                  <select
                    value={carFormSize}
                    onChange={(e) =>
                      setCarFormSize(e.target.value as "軽自動車" | "普通車")
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value="軽自動車">軽自動車</option>
                    <option value="普通車">普通車</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    車検満了日 *
                  </label>
                  <input
                    type="date"
                    value={carFormInspection}
                    onChange={(e) => setCarFormInspection(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    最終オイル交換日 *
                  </label>
                  <input
                    type="date"
                    value={carFormOil}
                    onChange={(e) => setCarFormOil(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    ステータス
                  </label>
                  <select
                    value={carFormStatus}
                    onChange={(e) =>
                      setCarFormStatus(
                        e.target.value as "貸出可" | "貸出不可",
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value="貸出可">貸出可</option>
                    <option value="貸出不可">貸出不可</option>
                  </select>
                </div>
                <div style={{ paddingTop: isMobile ? "0" : "18px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#334155",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={carFormEtc}
                      onChange={(e) => setCarFormEtc(e.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#2563eb",
                      }}
                    />
                    ETC車載器あり
                  </label>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  備考
                </label>
                <textarea
                  placeholder="車両に関する特記事項など"
                  value={carFormNote}
                  onChange={(e) => setCarFormNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    height: "60px",
                    resize: "none",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                backgroundColor: "#f8fafc",
              }}
            >
              <button
                onClick={() => setIsCarModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#fff",
                  color: "#475569",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveCar}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}