import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Aperture,
  Award,
  Camera,
  ChevronRight,
  CircleHelp,
  Clock3,
  Crosshair,
  Crown,
  Gauge,
  Grid2X2,
  History,
  Layers3,
  Lightbulb,
  Maximize2,
  Menu,
  MicOff,
  MonitorPlay,
  MoreHorizontal,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Undo2,
  Video,
  Volume2,
  VolumeX,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type Side = "red" | "black";
type PieceType = "general" | "advisor" | "elephant" | "horse" | "chariot" | "cannon" | "soldier";
type Piece = { side: Side; type: PieceType };
type Board = Array<Array<Piece | null>>;
type Position = [number, number];
type Move = { from: Position; to: Position; captured: Piece | null; piece: Piece };

const RED: Side = "red";
const BLACK: Side = "black";
const PIECE_LABELS: Record<Side, Record<PieceType, string>> = {
  red: { general: "帥", advisor: "仕", elephant: "相", horse: "馬", chariot: "俥", cannon: "炮", soldier: "兵" },
  black: { general: "將", advisor: "士", elephant: "象", horse: "馬", chariot: "車", cannon: "砲", soldier: "卒" },
};
const PIECE_NAMES: Record<PieceType, string> = {
  general: "Tướng",
  advisor: "Sĩ",
  elephant: "Tượng",
  horse: "Mã",
  chariot: "Xe",
  cannon: "Pháo",
  soldier: "Tốt",
};
const PIECE_VALUE: Record<PieceType, number> = {
  general: 10000,
  advisor: 120,
  elephant: 120,
  horse: 300,
  chariot: 600,
  cannon: 350,
  soldier: 70,
};
const COL_LABELS = ["九", "八", "七", "六", "五", "四", "三", "二", "一"];

function emptyBoard(): Board {
  return Array.from({ length: 10 }, () => Array<Piece | null>(9).fill(null));
}

function initialBoard(): Board {
  const board = emptyBoard();
  const back: PieceType[] = ["chariot", "horse", "elephant", "advisor", "general", "advisor", "elephant", "horse", "chariot"];
  back.forEach((type, col) => {
    board[0][col] = { side: BLACK, type };
    board[9][col] = { side: RED, type };
  });
  [1, 7].forEach((col) => {
    board[2][col] = { side: BLACK, type: "cannon" };
    board[7][col] = { side: RED, type: "cannon" };
  });
  [0, 2, 4, 6, 8].forEach((col) => {
    board[3][col] = { side: BLACK, type: "soldier" };
    board[6][col] = { side: RED, type: "soldier" };
  });
  return board;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

function inside(row: number, col: number) {
  return row >= 0 && row < 10 && col >= 0 && col < 9;
}

function palace(side: Side, row: number, col: number) {
  return col >= 3 && col <= 5 && (side === RED ? row >= 7 : row <= 2);
}

function inOwnTerritory(side: Side, row: number) {
  return side === RED ? row >= 5 : row <= 4;
}

function addIfValid(board: Board, moves: Position[], side: Side, row: number, col: number) {
  if (!inside(row, col) || board[row][col]?.side === side) return;
  moves.push([row, col]);
}

function pseudoMoves(board: Board, row: number, col: number): Position[] {
  const piece = board[row]?.[col];
  if (!piece) return [];
  const { side, type } = piece;
  const moves: Position[] = [];

  if (type === "general") {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      const nr = row + dr;
      const nc = col + dc;
      if (inside(nr, nc) && palace(side, nr, nc)) addIfValid(board, moves, side, nr, nc);
    });
    const step = side === RED ? -1 : 1;
    let nr = row + step;
    while (inside(nr, col)) {
      if (board[nr][col]) {
        if (board[nr][col]?.type === "general" && board[nr][col]?.side !== side) moves.push([nr, col]);
        break;
      }
      nr += step;
    }
  }

  if (type === "advisor") {
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => {
      const nr = row + dr;
      const nc = col + dc;
      if (inside(nr, nc) && palace(side, nr, nc)) addIfValid(board, moves, side, nr, nc);
    });
  }

  if (type === "elephant") {
    [[-2, -2], [-2, 2], [2, -2], [2, 2]].forEach(([dr, dc]) => {
      const nr = row + dr;
      const nc = col + dc;
      if (!inside(nr, nc) || !inOwnTerritory(side, nr) || board[row + dr / 2][col + dc / 2]) return;
      addIfValid(board, moves, side, nr, nc);
    });
  }

  if (type === "horse") {
    const jumps: Array<[number, number, number, number]> = [
      [-2, -1, -1, 0], [-2, 1, -1, 0], [2, -1, 1, 0], [2, 1, 1, 0],
      [-1, -2, 0, -1], [1, -2, 0, -1], [-1, 2, 0, 1], [1, 2, 0, 1],
    ];
    jumps.forEach(([dr, dc, lr, lc]) => {
      if (!board[row + lr]?.[col + lc]) addIfValid(board, moves, side, row + dr, col + dc);
    });
  }

  if (type === "chariot" || type === "cannon") {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      let nr = row + dr;
      let nc = col + dc;
      let screen = false;
      while (inside(nr, nc)) {
        const target = board[nr][nc];
        if (!target) {
          if (!screen) moves.push([nr, nc]);
        } else if (!screen) {
          if (type === "chariot") addIfValid(board, moves, side, nr, nc);
          screen = true;
        } else {
          if (type === "cannon" && target.side !== side) moves.push([nr, nc]);
          break;
        }
        nr += dr;
        nc += dc;
      }
    });
  }

  if (type === "soldier") {
    const forward = side === RED ? -1 : 1;
    addIfValid(board, moves, side, row + forward, col);
    const crossed = side === RED ? row <= 4 : row >= 5;
    if (crossed) {
      addIfValid(board, moves, side, row, col - 1);
      addIfValid(board, moves, side, row, col + 1);
    }
  }

  return moves;
}

function applyMove(board: Board, from: Position, to: Position): Board {
  const next = cloneBoard(board);
  next[to[0]][to[1]] = next[from[0]][from[1]];
  next[from[0]][from[1]] = null;
  return next;
}

function allMoves(board: Board, side: Side): Move[] {
  const moves: Move[] = [];
  board.forEach((row, r) => row.forEach((piece, c) => {
    if (piece?.side !== side) return;
    pseudoMoves(board, r, c).forEach(([nr, nc]) => moves.push({ from: [r, c], to: [nr, nc], captured: board[nr][nc], piece }));
  }));
  return moves;
}

function evaluate(board: Board) {
  let score = 0;
  board.forEach((row, r) => row.forEach((piece) => {
    if (!piece) return;
    const advance = piece.type === "soldier" ? (piece.side === BLACK ? r : 9 - r) * 5 : 0;
    const value = PIECE_VALUE[piece.type] + advance;
    score += piece.side === BLACK ? value : -value;
  }));
  return score;
}

function minimax(board: Board, depth: number, maximizing: boolean, alpha: number, beta: number): number {
  if (depth === 0) return evaluate(board);
  const side: Side = maximizing ? BLACK : RED;
  const moves = allMoves(board, side).sort((a, b) => (b.captured ? PIECE_VALUE[b.captured.type] : 0) - (a.captured ? PIECE_VALUE[a.captured.type] : 0)).slice(0, 28);
  if (!moves.length) return maximizing ? -99999 : 99999;
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    const value = minimax(applyMove(board, move.from, move.to), depth - 1, !maximizing, alpha, beta);
    if (maximizing) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, value);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, value);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function findBestMove(board: Board, side: Side, depth = 2): Move | null {
  const moves = allMoves(board, side).sort((a, b) => (b.captured ? PIECE_VALUE[b.captured.type] : 0) - (a.captured ? PIECE_VALUE[a.captured.type] : 0));
  if (!moves.length) return null;
  let best = moves[0];
  let bestScore = side === BLACK ? -Infinity : Infinity;
  moves.slice(0, 36).forEach((move) => {
    const score = minimax(applyMove(board, move.from, move.to), depth - 1, side === RED, -Infinity, Infinity) + (move.captured ? (side === BLACK ? PIECE_VALUE[move.captured.type] : -PIECE_VALUE[move.captured.type]) : 0);
    if ((side === BLACK && score > bestScore) || (side === RED && score < bestScore)) {
      bestScore = score;
      best = move;
    }
  });
  return best;
}

function coord([row, col]: Position) {
  return `${COL_LABELS[col]}${10 - row}`;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function Badge({ children, tone = "jade" }: { children: React.ReactNode; tone?: "jade" | "gold" | "muted" | "danger" }) {
  return <span className={`status-badge status-${tone}`}><span className="status-dot" />{children}</span>;
}

function CameraTile({ side, videoRef, active, label, helper, onFullscreen }: { side: "front" | "rear"; videoRef: React.RefObject<HTMLVideoElement | null>; active: boolean; label: string; helper: string; onFullscreen: () => void }) {
  return (
    <div className={`camera-tile ${active ? "camera-live" : ""}`}>
      <div className="camera-visual">
        <video ref={videoRef} autoPlay playsInline muted className={active ? "is-visible" : ""} />
        {!active && <div className={`camera-placeholder camera-${side}`}><div className="camera-placeholder-icon"><Camera size={20} /></div><span>Chờ cấp quyền camera</span></div>}
        <div className="camera-gradient" />
        <div className="camera-topline"><span className="camera-label"><span className="camera-line-dot" />{label}</span><button className="icon-button subtle" onClick={onFullscreen} aria-label="Phóng to camera"><Maximize2 size={14} /></button></div>
        <div className="camera-bottomline"><span className="camera-helper">{helper}</span><span className="camera-resolution">{active ? "LIVE · 720p" : "OFFLINE"}</span></div>
      </div>
    </div>
  );
}

function CameraLab({ active, frontVideoRef, rearVideoRef, startCameras, stopCameras, onFullscreen }: { active: boolean; frontVideoRef: React.RefObject<HTMLVideoElement | null>; rearVideoRef: React.RefObject<HTMLVideoElement | null>; startCameras: () => void; stopCameras: () => void; onFullscreen: (ref: React.RefObject<HTMLVideoElement | null>) => void }) {
  return (
    <section className="camera-lab-view">
      <div className="section-heading-row">
        <div><span className="eyebrow"><Aperture size={13} /> Camera lab / Dual stream</span><h2>Hai góc nhìn, cùng một nhịp.</h2><p>Ghép camera trước và sau để quan sát không gian xung quanh trong một workspace.</p></div>
        <button className={`primary-button ${active ? "stop-button" : ""}`} onClick={active ? stopCameras : startCameras}>{active ? <><X size={16} /> Tắt hai camera</> : <><Video size={16} /> Kích hoạt dual camera</>}</button>
      </div>
      <div className="camera-lab-grid">
        <CameraTile side="front" videoRef={frontVideoRef} active={active} label="CAM 01 / TRƯỚC" helper="Góc nhìn người chơi" onFullscreen={() => onFullscreen(frontVideoRef)} />
        <CameraTile side="rear" videoRef={rearVideoRef} active={active} label="CAM 02 / SAU" helper="Góc nhìn môi trường" onFullscreen={() => onFullscreen(rearVideoRef)} />
      </div>
      <div className="camera-note"><Shield size={16} /><span>Luồng hình ảnh chạy cục bộ trên trình duyệt. Không ghi hình, không tải dữ liệu lên máy chủ.</span><Badge tone={active ? "jade" : "muted"}>{active ? "Đang bảo mật" : "Sẵn sàng"}</Badge></div>
    </section>
  );
}

function XiangqiBoard({ board, selected, targets, hint, onCellClick }: { board: Board; selected: Position | null; targets: Set<string>; hint: Position | null; onCellClick: (row: number, col: number) => void }) {
  return (
    <div className="board-wrap">
      <div className="board-axis top-axis">{COL_LABELS.map((label) => <span key={label}>{label}</span>)}</div>
      <div className="board-frame">
        <div className="board-surface">
          <div className="river-band"><span>楚河</span><span className="river-dash">· · · · · · · · ·</span><span>漢界</span></div>
          <div className="board-grid">
            {board.map((row, r) => row.map((piece, c) => {
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isTarget = targets.has(`${r}-${c}`);
              const isHint = hint?.[0] === r && hint?.[1] === c;
              return <button key={`${r}-${c}`} className={`board-cell ${isSelected ? "selected" : ""} ${isTarget ? "target" : ""} ${isHint ? "hinted" : ""}`} onClick={() => onCellClick(r, c)} aria-label={piece ? `${PIECE_NAMES[piece.type]} ${piece.side === RED ? "đỏ" : "đen"}` : `Ô ${coord([r, c])}`}>
                {piece && <span className={`chess-piece piece-${piece.side}`}><span>{PIECE_LABELS[piece.side][piece.type]}</span></span>}
                {isTarget && !piece && <span className="move-dot" />}
                {isTarget && piece && <span className="capture-ring" />}
                {isHint && <span className="hint-star"><Sparkles size={11} /></span>}
              </button>;
            }))}
          </div>
        </div>
      </div>
      <div className="board-axis bottom-axis">{["一", "二", "三", "四", "五", "六", "七", "八", "九"].map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

function ChessArena({ board, selected, targets, hint, onCellClick, onReset, onUndo, onHint, isThinking, turn, history, elapsed }: { board: Board; selected: Position | null; targets: Set<string>; hint: Position | null; onCellClick: (row: number, col: number) => void; onReset: () => void; onUndo: () => void; onHint: () => void; isThinking: boolean; turn: Side; history: string[]; elapsed: number }) {
  return (
    <section className="chess-arena">
      <div className="arena-header"><div><span className="eyebrow"><Grid2X2 size={13} /> Xiangqi / Ranked room</span><h2>Phòng đấu <span>#XQ-081</span></h2></div><div className="arena-header-actions"><Badge tone="gold"><Zap size={12} /> SIÊU KHÓ</Badge><button className="icon-button" aria-label="Tùy chọn"><MoreHorizontal size={18} /></button></div></div>
      <div className="match-strip"><div className="player-card active-player"><div className="avatar red-avatar">你</div><div><strong>Người chơi</strong><span>ĐỎ · 1500 ELO</span></div><div className="clock active-clock"><Clock3 size={13} /> {formatTime(Math.max(0, 15 * 60 - elapsed))}</div></div><div className="versus"><span>VS</span><i /></div><div className={`player-card ${turn === BLACK ? "active-player" : ""}`}><div className="avatar bot-avatar"><Crown size={15} /></div><div><strong>AI / Hắc Long</strong><span>ĐEN · 2480 ELO</span></div><div className="clock"><Activity size={13} /> {isThinking ? "ĐANG TÍNH" : "READY"}</div></div></div>
      <div className="board-area"><XiangqiBoard board={board} selected={selected} targets={targets} hint={hint} onCellClick={onCellClick} /></div>
      <div className="arena-toolbar"><div className={`turn-indicator ${isThinking ? "thinking" : ""}`}><span className="turn-light" />{isThinking ? "Hắc Long đang tính nước..." : turn === RED ? "Đến lượt bạn · chọn một quân đỏ" : "Đang khóa bàn · AI sắp ra quân"}</div><div className="toolbar-actions"><button className="tool-button" onClick={onHint}><Lightbulb size={15} /> Gợi ý</button><button className="tool-button" onClick={onUndo}><Undo2 size={15} /> Hoàn tác</button><button className="tool-button" onClick={onReset}><RotateCcw size={15} /> Ván mới</button></div></div>
      <div className="move-history"><div className="history-heading"><span><History size={14} /> Nhật ký nước đi</span><span>{history.length} ply</span></div><div className="history-scroll">{history.length === 0 ? <span className="history-empty">Bàn cờ đã sẵn sàng. Nước khai cuộc thuộc về bạn.</span> : history.map((item, index) => <span key={`${item}-${index}`} className={index === history.length - 1 ? "latest-move" : ""}>{item}</span>)}</div></div>
    </section>
  );
}

function CameraSidebar({ active, startCameras, stopCameras, frontVideoRef, rearVideoRef, onFullscreen }: { active: boolean; startCameras: () => void; stopCameras: () => void; frontVideoRef: React.RefObject<HTMLVideoElement | null>; rearVideoRef: React.RefObject<HTMLVideoElement | null>; onFullscreen: (ref: React.RefObject<HTMLVideoElement | null>) => void }) {
  return <aside className="camera-sidebar"><div className="side-heading"><div><span className="eyebrow"><MonitorPlay size={13} /> Live monitor</span><h3>Dual camera</h3></div><Badge tone={active ? "jade" : "muted"}>{active ? "2 tín hiệu" : "offline"}</Badge></div><div className="camera-stack"><CameraTile side="front" videoRef={frontVideoRef} active={active} label="CAM 01 / TRƯỚC" helper="Góc nhìn người chơi" onFullscreen={() => onFullscreen(frontVideoRef)} /><CameraTile side="rear" videoRef={rearVideoRef} active={active} label="CAM 02 / SAU" helper="Góc nhìn môi trường" onFullscreen={() => onFullscreen(rearVideoRef)} /></div><button className={`camera-cta ${active ? "active" : ""}`} onClick={active ? stopCameras : startCameras}>{active ? <><Wifi size={15} /> Hai camera đang phát</> : <><Video size={15} /> Bật 2 camera ngay</>}<ChevronRight size={16} /></button><div className="camera-mini-stats"><div><span className="stat-number">02</span><span className="stat-label">góc nhìn</span></div><div><span className="stat-number">720p</span><span className="stat-label">độ nét</span></div><div><span className="stat-number">0ms</span><span className="stat-label">upload</span></div></div></aside>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<"arena" | "camera">("arena");
  const [board, setBoard] = useState<Board>(() => initialBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [targets, setTargets] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<Position | null>(null);
  const [turn, setTurn] = useState<Side>(RED);
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<Board[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioOn, setAudioOn] = useState(false);
  const [fullscreenRef, setFullscreenRef] = useState<React.RefObject<HTMLVideoElement | null> | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  const rearVideoRef = useRef<HTMLVideoElement>(null);
  const streamsRef = useRef<MediaStream[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (fullscreenRef?.current) fullscreenRef.current.requestFullscreen?.().catch(() => undefined);
  }, [fullscreenRef]);

  const currentTargets = useMemo(() => targets, [targets]);

  const stopCameras = useCallback(() => {
    streamsRef.current.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
    streamsRef.current = [];
    if (frontVideoRef.current) frontVideoRef.current.srcObject = null;
    if (rearVideoRef.current) rearVideoRef.current.srcObject = null;
    setCameraActive(false);
    setCameraError(null);
  }, []);

  const startCameras = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Trình duyệt không hỗ trợ camera.");
      toast.error("Không thể truy cập camera trên trình duyệt này.");
      return;
    }
    try {
      stopCameras();
      const front = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamsRef.current.push(front);
      if (frontVideoRef.current) frontVideoRef.current.srcObject = front;
      let rear: MediaStream | null = null;
      try {
        rear = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      } catch {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        if (cameras[1]) rear = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: cameras[1].deviceId } }, audio: false });
      }
      if (rear) {
        streamsRef.current.push(rear);
        if (rearVideoRef.current) rearVideoRef.current.srcObject = rear;
      }
      setCameraActive(true);
      setCameraError(rear ? null : "Thiết bị chỉ cho phép một camera — CAM 02 đang chờ.");
      toast.success(rear ? "Đã bật đồng thời camera trước và sau." : "Đã bật camera trước. Không tìm thấy camera thứ hai.");
    } catch {
      setCameraError("Quyền camera chưa được cấp hoặc thiết bị đang bận.");
      toast.error("Hãy cấp quyền camera để bắt đầu dual stream.");
    }
  }, [stopCameras]);

  useEffect(() => () => stopCameras(), [stopCameras]);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioOn) {
      audio.pause();
      setAudioOn(false);
      return;
    }
    try {
      await audio.play();
      setAudioOn(true);
    } catch {
      toast.error("Trình duyệt đã chặn âm thanh — hãy bấm lại để phát.");
    }
  };

  const selectPiece = (row: number, col: number) => {
    if (isThinking || turn !== RED) return;
    const piece = board[row][col];
    if (piece?.side === RED) {
      setSelected([row, col]);
      setTargets(new Set(pseudoMoves(board, row, col).map(([r, c]) => `${r}-${c}`)));
      setHint(null);
      return;
    }
    if (selected && targets.has(`${row}-${col}`)) {
      const from = selected;
      const moving = board[from[0]][from[1]];
      if (!moving) return;
      const captured = board[row][col];
      const next = applyMove(board, from, [row, col]);
      setSnapshots((items) => [...items, board]);
      setBoard(next);
      setHistory((items) => [...items, `${items.length + 1}. ${PIECE_LABELS[RED][moving.type]} ${coord(from)} → ${coord([row, col])}${captured ? " ×" : ""}`]);
      setSelected(null);
      setTargets(new Set());
      setHint(null);
      setTurn(BLACK);
      setIsThinking(true);
      window.setTimeout(() => {
        const aiMove = findBestMove(next, BLACK, 2);
        if (aiMove) {
          const aiBoard = applyMove(next, aiMove.from, aiMove.to);
          setBoard(aiBoard);
          setHistory((items) => [...items, `${items.length + 1}. ${PIECE_LABELS[BLACK][aiMove.piece.type]} ${coord(aiMove.from)} → ${coord(aiMove.to)}${aiMove.captured ? " ×" : ""}`]);
        }
        setIsThinking(false);
        setTurn(RED);
      }, 620);
    }
  };

  const resetGame = () => {
    setBoard(initialBoard());
    setSelected(null);
    setTargets(new Set());
    setHint(null);
    setTurn(RED);
    setIsThinking(false);
    setHistory([]);
    setSnapshots([]);
    setElapsed(0);
    toast.success("Ván đấu mới đã sẵn sàng.");
  };

  const undoMove = () => {
    if (isThinking || snapshots.length < 2) {
      toast.info("Cần ít nhất một cặp nước đi để hoàn tác.");
      return;
    }
    const nextSnapshots = snapshots.slice(0, -2);
    setBoard(nextSnapshots.length ? nextSnapshots[nextSnapshots.length - 1] : initialBoard());
    setSnapshots(nextSnapshots);
    setHistory((items) => items.slice(0, -2));
    setTurn(RED);
    setSelected(null);
    setTargets(new Set());
    toast("Đã lùi lại một lượt.");
  };

  const showHint = () => {
    if (isThinking || turn !== RED) return;
    const move = findBestMove(board, RED, 1);
    if (move) {
      setSelected(move.from);
      setTargets(new Set([`${move.to[0]}-${move.to[1]}`]));
      setHint(move.to);
      toast("Gợi ý: giữ thế trung tâm và ép cánh phải.");
    }
  };

  return (
    <div className="app-shell">
      <audio ref={audioRef} src="/manus-storage/ancient-war-ambience_e10f0ad0.mp3" loop preload="metadata" />
      <header className="topbar"><div className="brand-lockup"><div className="brand-mark"><Swords size={18} /></div><div><div className="brand-name">DUAL<span>CAM</span> / XQ</div><div className="brand-sub">ARENA OS · 01</div></div></div><nav className="topnav" aria-label="Điều hướng chính"><button className={activeView === "arena" ? "active" : ""} onClick={() => setActiveView("arena")}><Grid2X2 size={15} /> Arena</button><button className={activeView === "camera" ? "active" : ""} onClick={() => setActiveView("camera")}><Aperture size={15} /> Camera lab</button></nav><div className="topbar-right"><span className="secure-status"><span className="status-dot" /> Local session</span><button className={`icon-button audio-toggle ${audioOn ? "audio-on" : ""}`} onClick={toggleAudio} aria-label={audioOn ? "Tắt âm thanh chiến trận" : "Bật âm thanh chiến trận"}>{audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</button><button className="avatar user-avatar">DN</button><button className="mobile-menu icon-button"><Menu size={18} /></button></div></header>
      <main className="app-main">
        <div className="page-intro"><div><span className="eyebrow"><Crosshair size={13} /> COMMAND CENTER / HÀ NỘI · 13:39</span><h1>Một ván cờ.<br /><em>Hai góc nhìn.</em></h1><p>Chơi cờ tướng với Hắc Long ở cấp độ siêu khó — đồng thời giữ trọn không gian trong tầm mắt.</p></div><div className="intro-metrics"><div><span className="metric-value"><span className="live-pulse" /> 02</span><span className="metric-label">camera ready</span></div><div><span className="metric-value">2480</span><span className="metric-label">AI rating</span></div><div><span className="metric-value">01:1</span><span className="metric-label">mode / local</span></div></div></div>
        {cameraError && <div className="camera-alert"><MicOff size={15} /><span>{cameraError}</span><button onClick={() => setCameraError(null)} aria-label="Đóng thông báo"><X size={15} /></button></div>}
        {activeView === "camera" ? <CameraLab active={cameraActive} frontVideoRef={frontVideoRef} rearVideoRef={rearVideoRef} startCameras={startCameras} stopCameras={stopCameras} onFullscreen={setFullscreenRef} /> : <div className="workspace-grid"><ChessArena board={board} selected={selected} targets={currentTargets} hint={hint} onCellClick={selectPiece} onReset={resetGame} onUndo={undoMove} onHint={showHint} isThinking={isThinking} turn={turn} history={history} elapsed={elapsed} /><CameraSidebar active={cameraActive} startCameras={startCameras} stopCameras={stopCameras} frontVideoRef={frontVideoRef} rearVideoRef={rearVideoRef} onFullscreen={setFullscreenRef} /></div>}
        <footer className="app-footer"><span><Shield size={13} /> Dữ liệu camera chỉ tồn tại trong phiên này</span><span className="footer-divider" /><span>© 2026 DualCam Systems</span><span className="footer-spacer" /><span className="keyboard-hint"><span>?</span> Hướng dẫn nhanh</span></footer>
      </main>
    </div>
  );
}
