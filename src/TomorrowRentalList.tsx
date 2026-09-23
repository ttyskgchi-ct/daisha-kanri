// TomorrowRentalList.tsx
import { useState, useEffect } from "react";
import { format, addDays, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TomorrowRentalItem {
  id: string;
  car_name: string;
  number_plate: string;
  parking_label: string;
  rental_time: string;
  customer_name: string;
  car_type: string;
  purpose: string;
  staff_name: string;
  note: string;
}

// 全角英数字を半角へ統一し、末尾のナンバープレート番号（1〜4桁）だけを抽出する。
// 例:
// 「ライズ6091」     -> "6091"
// 「ライズ６０９１」 -> "6091"
// 「スペーシア631」   -> "631"
// 「マツダ3」         -> "3"
const extractPlateNumber = (value: string): string => {
  if (!value) return "";

  const normalized = value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );

  const match = normalized.match(/(\d{1,4})\s*$/);
  return match ? match[1] : "";
};

export default function TomorrowRentalList() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );
  const [items, setItems] = useState<TomorrowRentalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 今日から7日分の日付選択肢を作成
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      value: format(d, "yyyy-MM-dd"),
      label:
        format(d, "M月d日(EEE)", { locale: ja }) + (i === 1 ? "【明日】" : ""),
    };
  });

  const fetchTomorrowList = async () => {
    setLoading(true);
    try {
      const targetStart = `${selectedDate}T00:00:00.000Z`;
      const targetEnd = `${selectedDate}T23:59:59.999Z`;

      // 1. 指定日の確定予約を取得
      //    明日貸出予定で表示する予約情報をまとめて取得する
      const { data: resData, error: resError } = await supabase
        .from("daisha_reservations")
        .select(
          "id, car_id, start_at, customer_name, car_type, purpose, staff_name, note",
        )
        .eq("status", "確定")
        .not("car_id", "is", null)
        .gte("start_at", targetStart)
        .lte("start_at", targetEnd);

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

      // 3. 駐車位置用テーブル parking_slots を取得
      const { data: slotData, error: slotError } = await supabase
        .from("parking_slots")
        .select("car_name, label");

      if (slotError) {
        console.warn("parking_slotsの取得に失敗しました:", slotError);
      }

      // 4. 予約情報を基準に、車両情報・駐車位置・予約詳細をまとめる
      //    駐車位置は車名ではなく、末尾のナンバープレート番号を抽出して完全一致で照合する。
      //    全角数字・半角数字の入力揺れには対応する。
      const result: TomorrowRentalItem[] = (resData || [])
        .map((reservation) => {
          const car = (carData || []).find(
            (carItem) => carItem.id === reservation.car_id,
          );

          if (!car) return null;

          const carPlateNumber = extractPlateNumber(car.number_plate);

          const matchedSlot = (slotData || []).find((slot) => {
            if (!slot.car_name) return false;

            const slotPlateNumber = extractPlateNumber(slot.car_name);

            return (
              carPlateNumber.length > 0 &&
              slotPlateNumber.length > 0 &&
              carPlateNumber === slotPlateNumber
            );
          });

          return {
            id: reservation.id,
            car_name: car.car_name,
            number_plate: car.number_plate,
            parking_label: matchedSlot ? matchedSlot.label : "未設定",
            rental_time: reservation.start_at
              ? format(parseISO(reservation.start_at), "HH:mm")
              : "未設定",
            customer_name: reservation.customer_name || "未設定",
            car_type: reservation.car_type || "未入力",
            purpose: reservation.purpose || "未入力",
            staff_name: reservation.staff_name || "未入力",
            note: reservation.note || "",
          };
        })
        .filter((item): item is TomorrowRentalItem => item !== null);

      setItems(result);
    } catch (err) {
      console.error("明日貸出予定の取得エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTomorrowList();
  }, [selectedDate]);

  return (
    <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
      {/* 印刷時には非表示にするUI操作エリア */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: #fff !important; }
          .print-area { padding: 0 !important; }
          .rental-list-table {
            font-size: 10px !important;
          }
          .rental-list-table th,
          .rental-list-table td {
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

      {/* 印刷対象のメインエリア */}
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
          貸出予定車両リスト （
          {format(new Date(selectedDate), "yyyy年M月d日", { locale: ja })}）
        </h2>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            読み込み中...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#64748b" }}
          >
            指定された日の貸出予定車両はありません。
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              className="rental-list-table"
              style={{
                width: "100%",
                minWidth: "1250px",
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
                    "駐車位置",
                    "貸出時間",
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
                        textAlign:
                          label === "駐車位置" || label === "貸出時間"
                            ? "center"
                            : "left",
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
                  <tr key={item.id} style={{ borderBottom: "1px solid #cbd5e1" }}>
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
                        fontSize: "15px",
                        fontWeight: "bold",
                        textAlign: "center",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.parking_label}
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
                      {item.rental_time}
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
