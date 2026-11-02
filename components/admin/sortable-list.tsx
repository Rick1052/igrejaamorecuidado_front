"use client";

import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useId, useState, type DragEvent, type ReactNode } from "react";

// Lista reordenável por arrastar e soltar (puxando pela alça) ou pelas setas, que também funcionam no teclado e no celular.
// Cada lista usa um tipo de dado próprio no arraste, então listas aninhadas (botões dentro de seções) não se misturam.
export function SortableList<T extends { id: string }>({ items, onChange, renderItem, itemLabel, emptyText }: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  itemLabel: (item: T) => string;
  emptyText?: string;
}) {
  // O navegador guarda o tipo em minúsculas e o useId do React tem símbolos, então só letras e números entram no nome.
  const listType = `application/x-iac-sortable-${useId().replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const [dragging, setDragging] = useState<string | null>(null);
  const [target, setTarget] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || to > items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to > from ? to - 1 : to, 0, item);
    onChange(next);
  }

  // Posição de inserção: antes ou depois do item, conforme a metade em que o cursor está.
  // Aceitar também o dragenter garante o drop quando o mouse é solto logo ao entrar no item.
  function handleDragOver(event: DragEvent<HTMLLIElement>, index: number) {
    if (!event.dataTransfer.types.includes(listType)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    setTarget(event.clientY > rect.top + rect.height / 2 ? index + 1 : index);
  }

  function handleDrop(event: DragEvent<HTMLLIElement>) {
    if (!event.dataTransfer.types.includes(listType)) return;
    event.preventDefault();
    event.stopPropagation();
    const from = items.findIndex(item => item.id === event.dataTransfer.getData(listType));
    if (from >= 0 && target !== null) move(from, target);
    reset();
  }

  function reset() { setDragging(null); setTarget(null); }

  // Só a alça é arrastável, para não atrapalhar a seleção de texto nos campos; o item inteiro aparece como prévia.
  function handleDragStart(event: DragEvent<HTMLSpanElement>, item: T) {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(listType, item.id);
    event.dataTransfer.setData("text/plain", itemLabel(item));
    const row = event.currentTarget.closest("li");
    if (row) event.dataTransfer.setDragImage(row, 20, 20);
    setDragging(item.id);
  }

  if (!items.length) return emptyText ? <p className="sortable-empty">{emptyText}</p> : null;

  return <ul className="sortable-list">
    {items.map((item, index) => <li
      key={item.id}
      className={`sortable-item ${dragging === item.id ? "is-dragging" : ""} ${target === index ? "drop-before" : ""} ${target === index + 1 && index === items.length - 1 ? "drop-after" : ""}`}
      onDragEnter={event => handleDragOver(event, index)}
      onDragOver={event => handleDragOver(event, index)}
      onDrop={handleDrop}
    >
      <div className="sortable-handle">
        <span className="sortable-grip" title="Arraste para mudar a posição" draggable onDragStart={event => handleDragStart(event, item)} onDragEnd={reset}><GripVertical /></span>
        <button type="button" aria-label={`Mover ${itemLabel(item)} para cima`} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp /></button>
        <button type="button" aria-label={`Mover ${itemLabel(item)} para baixo`} disabled={index === items.length - 1} onClick={() => move(index, index + 2)}><ArrowDown /></button>
      </div>
      <div className="sortable-content">{renderItem(item, index)}</div>
    </li>)}
  </ul>;
}
