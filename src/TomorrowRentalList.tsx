// TomorrowRentalList.tsx
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
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
      const { data: resData, error: resError } = await supabase
        .from("daisha_reservations")
        .select("car_id")
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

      // 4. 車両情報と駐車位置をマッチング
      //    車名ではなく、末尾のナンバープレート番号を抽出して完全一致で照合する。
      //    全角数字・半角数字の入力揺れには対応する。
      const result: TomorrowRentalItem[] = (carData || []).map((car) => {
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
          id: car.id,
          car_name: car.car_name,
          number_plate: car.number_plate,
          parking_label: matchedSlot ? matchedSlot.label : "未設定",
        };
      });

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
          <div style={{ maxWidth: "600px", width: "100%" }}>
            <table
              style={{
                width: "100%",
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
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    車両情報（車名）
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    ナンバープレート
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontSize: "14px",
                      border: "1px solid #cbd5e1",
                      width: "150px",
                    }}
                  >
                    駐車位置
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #cbd5e1" }}>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "15px",
                        fontWeight: "bold",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      {item.car_name}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "15px",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      {item.number_plate}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        textAlign: "center",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      {item.parking_label}
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
