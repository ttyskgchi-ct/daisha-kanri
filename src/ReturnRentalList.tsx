// ReturnRentalList.tsx
import { useState, useEffect } from "react";
import { format, addDays, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ReturnRentalItem {
  id: string;
  car_name: string;
  number_plate: string;
  return_time: string;
  customer_name: string;
  car_type: string;
  purpose: string;
  staff_name: string;
  note: string;
}

export default function ReturnRentalList() {
  // 初期表示は「今日」
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [items, setItems] = useState<ReturnRentalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 前日を含む7日間：
  // 昨日 / 今日 / 明日 / 2日後 / 3日後 / 4日後 / 5日後
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 1;
    const d = addDays(new Date(), offset);

    let suffix = "";
    if (offset === -1) suffix = "【昨日】";
    if (offset === 0) suffix = "【今日】";
    if (offset === 1) suffix = "【明日】";

    return {
      value: format(d, "yyyy-MM-dd"),
      label: format(d, "M月d日(EEE)", { locale: ja }) + suffix,
    };
  });

  const fetchReturnList = async () => {
    setLoading(true);

    try {
      // selectedDate は利用者のローカル日付として扱い、
      // SupabaseへはISO形式に変換して検索する。
      const localStart = new Date(`${selectedDate}T00:00:00`);
      const localEnd = new Date(`${selectedDate}T23:59:59.999`);
      const targetStart = localStart.toISOString();
      const targetEnd = localEnd.toISOString();

      // 1. 指定日に「返却予定」の確定予約を取得
      const { data: resData, error: resError } = await supabase
        .from("daisha_reservations")
        .select(
          "id, car_id, end_at, customer_name, car_type, purpose, staff_name, note",
        )
        .eq("status", "確定")
        .not("car_id", "is", null)
        .gte("end_at", targetStart)
        .lte("end_at", targetEnd)
        .order("end_at", { ascending: true });

      if (resError) throw resError;

      const carIds = Array.from(
        new Set((resData || []).map((r) => r.car_id).filter(Boolean)),
      );

      if (carIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // 2. 該当車両のマスター情報を取得
      const { data: carData, error: carError } = await supabase
        .from("daisha_masters")
        .select("id, car_name, number_plate")
        .in("id", carIds);

      if (carError) throw carError;

      // 3. 予約情報と代車マスターを結合
      const result: ReturnRentalItem[] = (resData || [])
        .map((reservation) => {
          const car = (carData || []).find(
            (carItem) => carItem.id === reservation.car_id,
          );

          if (!car) return null;

          return {
            id: reservation.id,
            car_name: car.car_name,
            number_plate: car.number_plate,
            return_time: reservation.end_at
              ? format(parseISO(reservation.end_at), "HH:mm")
              : "未設定",
            customer_name: reservation.customer_name || "未設定",
            car_type: reservation.car_type || "未入力",
            purpose: reservation.purpose || "未入力",
            staff_name: reservation.staff_name || "未入力",
            note: reservation.note || "",
          };
        })
        .filter((item): item is ReturnRentalItem => item !== null);

      setItems(result);
    } catch (err) {
      console.error("返却代車一覧の取得エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnList();
  }, [selectedDate]);

  return (
    <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
      {/* 印刷時には操作UIを非表示 */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: #fff !important; }
          .print-area { padding: 0 !important; }
          .return-list-table {
            font-size: 10px !important;
          }
          .return-list-table th,
          .return-list-table td {
            padding: 6px !important;
          }
        }
      `}</style>

      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label
            style={{ fontSize: "14px", fontWeight: "bold", color: "#334155" }}
          >
            対象日を選択:
          </label>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#fff",
            }}
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          🖨️ A4印刷 / PDF出力
        </button>
      </div>

      <div className="print-area">
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#0f172a",
            marginBottom: "16px",
            borderBottom: "2px solid #0f172a",
            paddingBottom: "8px",
          }}
        >
          返却予定車両リスト （
          {format(new Date(`${selectedDate}T00:00:00`), "yyyy年M月d日", {
            locale: ja,
          })}
          ）
        </h2>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            読み込み中...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#64748b" }}
          >
            指定された日の返却予定車両はありません。
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              className="return-list-table"
              style={{
                width: "100%",
                minWidth: "1100px",
                borderCollapse: "collapse",
                marginTop: "12px",
                backgroundColor: "#fff",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f1f5f9",
                    borderBottom: "2px solid #cbd5e1",
                  }}
                >
                  {[
                    "車両情報（車名）",
                    "ナンバープレート",
                    "返却時間",
                    "顧客名",
                    "預かり車種名",
                    "要件/目的",
                    "自社担当者",
                    "備考",
                  ].map((label) => (
                    <th
                      key={label}
                      style={{
                        padding: "10px",
                        textAlign: label === "返却時間" ? "center" : "left",
                        fontSize: "13px",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #cbd5e1" }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.car_name}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        fontSize: "14px",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.number_plate}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        textAlign: "center",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.return_time}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        fontSize: "14px",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.customer_name} 様
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        fontSize: "14px",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.car_type}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        fontSize: "14px",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.purpose}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        fontSize: "14px",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.staff_name}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        fontSize: "14px",
                        border: "1px solid #cbd5e1",
                        minWidth: "180px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {item.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
