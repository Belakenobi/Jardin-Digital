import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force'

import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import '@xyflow/react/dist/style.css'

import { getNotes } from '../services/notes.js'
import { getRelationsForNote } from '../services/relations.js'

const NODE_WIDTH = 240
const NODE_HEIGHT = 64
const NOTE_PREVIEW_LENGTH = 250

const maturityConfig = {
  seed: {
    emoji: '🌱',
    label: 'Semilla',
    borderColor: '#a3e635',
  },

  budding: {
    emoji: '🌿',
    label: 'Brote',
    borderColor: '#65a30d',
  },

  tree: {
    emoji: '🌳',
    label: 'Árbol',
    borderColor: '#3f6212',
  },
}

const nodeBaseStyle = {
  width: NODE_WIDTH,
  minHeight: NODE_HEIGHT,
  padding: 14,
  borderRadius: 14,
  background: '#1c1917',
  color: '#f5f5f4',
  border: '1px solid #44403c',
  fontSize: 14,
  fontWeight: 500,
}

function createInitialPosition(
  index,
  total,
) {
  if (total <= 1) {
    return {
      x: 0,
      y: 0,
    }
  }

  const angle =
    (index / total) *
    Math.PI *
    2

  const radius =
    180 +
    (index % 3) * 70

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

function createForceLayout(
  notes,
  relations,
) {
  const simulationNodes =
    notes.map((note, index) => {
      const initialPosition =
        createInitialPosition(
          index,
          notes.length,
        )

      return {
        id: note.id,
        x: initialPosition.x,
        y: initialPosition.y,
      }
    })

  const simulationLinks =
    relations.map((relation) => ({
      source: relation.sourceNoteId,
      target: relation.targetNoteId,
    }))

  const simulation =
    forceSimulation(simulationNodes)
      .force(
        'link',
        forceLink(simulationLinks)
          .id((node) => node.id)
          .distance(260)
          .strength(0.35),
      )
      .force(
        'charge',
        forceManyBody()
          .strength(-850),
      )
      .force(
        'center',
        forceCenter(0, 0),
      )
      .force(
        'collision',
        forceCollide()
          .radius(150)
          .strength(1),
      )
      .stop()

  for (
    let iteration = 0;
    iteration < 300;
    iteration += 1
  ) {
    simulation.tick()
  }

  return simulationNodes
}

function createNotePreview(content) {
  const text =
    content?.trim() ?? ''

  if (!text) {
    return 'Esta nota todavía no tiene contenido.'
  }

  if (
    text.length <=
    NOTE_PREVIEW_LENGTH
  ) {
    return text
  }

  return `${text
    .slice(
      0,
      NOTE_PREVIEW_LENGTH,
    )
    .trimEnd()}…`
}

function GraphPage() {
  const [
    nodes,
    setNodes,
    onNodesChange,
  ] = useNodesState([])

  const [
    edges,
    setEdges,
    onEdgesChange,
  ] = useEdgesState([])

  const [
    notes,
    setNotes,
  ] = useState([])

  const [
    relations,
    setRelations,
  ] = useState([])

  const [
    selectedNodeId,
    setSelectedNodeId,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  useEffect(() => {
    async function loadGraph() {
      try {
        setLoading(true)
        setError('')

        const notesResponse =
          await getNotes()

        const loadedNotes =
          notesResponse.notes ?? []

        setNotes(loadedNotes)

        if (
          loadedNotes.length === 0
        ) {
          setRelations([])
          setNodes([])
          setEdges([])
          return
        }

        const relationResponses =
          await Promise.all(
            loadedNotes.map((note) =>
              getRelationsForNote(
                note.id,
              ),
            ),
          )

        const outgoingRelations =
          relationResponses.flatMap(
            (response) =>
              response.relations
                ?.outgoing ?? [],
          )

        setRelations(
          outgoingRelations,
        )

        const layout =
          createForceLayout(
            loadedNotes,
            outgoingRelations,
          )

        const positionsById =
          new Map(
            layout.map((node) => [
              node.id,
              node,
            ]),
          )

        const graphNodes =
          loadedNotes.map((note) => {
            const maturity =
              maturityConfig[
                note.maturity
              ]
              ?? maturityConfig.seed

            const position =
              positionsById.get(
                note.id,
              )

            return {
              id: note.id,

              position: {
                x:
                  (position?.x ?? 0)
                  - NODE_WIDTH / 2,

                y:
                  (position?.y ?? 0)
                  - NODE_HEIGHT / 2,
              },

              data: {
                label:
                  `${maturity.emoji} ${note.title}`,
              },

              style: {
                ...nodeBaseStyle,
                borderColor:
                  maturity.borderColor,
              },
            }
          })

        const graphEdges =
          outgoingRelations.map(
            (relation) => ({
              id: relation.id,

              source:
                relation.sourceNoteId,

              target:
                relation.targetNoteId,

              markerEnd: {
                type:
                  MarkerType.ArrowClosed,
              },

              style: {
                stroke: '#84cc16',
                strokeWidth: 1.7,
                opacity: 0.75,
              },
            }),
          )

        setNodes(graphNodes)
        setEdges(graphEdges)
      } catch (requestError) {
        setError(
          requestError.message
          ?? 'No fue posible cargar el grafo.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadGraph()
  }, [
    setEdges,
    setNodes,
  ])

  const selectedNote =
    useMemo(
      () =>
        notes.find(
          (note) =>
            note.id === selectedNodeId,
        ) ?? null,
      [
        notes,
        selectedNodeId,
      ],
    )

  const selectedRelations =
    useMemo(() => {
      if (!selectedNodeId) {
        return {
          outgoing: [],
          incoming: [],
        }
      }

      return {
        outgoing:
          relations.filter(
            (relation) =>
              relation.sourceNoteId
              === selectedNodeId,
          ),

        incoming:
          relations.filter(
            (relation) =>
              relation.targetNoteId
              === selectedNodeId,
          ),
      }
    }, [
      relations,
      selectedNodeId,
    ])

  function getNoteTitle(noteId) {
    return (
      notes.find(
        (note) =>
          note.id === noteId,
      )?.title
      ?? 'Nota no disponible'
    )
  }

  function resetHighlight() {
    setSelectedNodeId(null)

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const note =
          notes.find(
            (currentNote) =>
              currentNote.id
              === node.id,
          )

        const maturity =
          maturityConfig[
            note?.maturity
          ]
          ?? maturityConfig.seed

        return {
          ...node,

          style: {
            ...nodeBaseStyle,
            borderColor:
              maturity.borderColor,
            opacity: 1,
            boxShadow: 'none',
          },
        }
      }),
    )

    setEdges((currentEdges) =>
      currentEdges.map(
        (edge) => ({
          ...edge,

          animated: false,

          style: {
            stroke: '#84cc16',
            strokeWidth: 1.7,
            opacity: 0.75,
          },
        }),
      ),
    )
  }

  function handleNodeClick(
    event,
    clickedNode,
  ) {
    event.stopPropagation()

    const nodeId =
      clickedNode.id

    setSelectedNodeId(nodeId)

    const connectedNodeIds =
      new Set([nodeId])

    relations.forEach(
      (relation) => {
        if (
          relation.sourceNoteId
          === nodeId
        ) {
          connectedNodeIds.add(
            relation.targetNoteId,
          )
        }

        if (
          relation.targetNoteId
          === nodeId
        ) {
          connectedNodeIds.add(
            relation.sourceNoteId,
          )
        }
      },
    )

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const note =
          notes.find(
            (currentNote) =>
              currentNote.id
              === node.id,
          )

        const maturity =
          maturityConfig[
            note?.maturity
          ]
          ?? maturityConfig.seed

        const isSelected =
          node.id === nodeId

        const isConnected =
          connectedNodeIds.has(
            node.id,
          )

        return {
          ...node,

          style: {
            ...nodeBaseStyle,

            borderColor:
              isSelected
                ? '#bef264'
                : maturity.borderColor,

            opacity:
              isConnected
                ? 1
                : 0.2,

            boxShadow:
              isSelected
                ? '0 0 0 2px #a3e635, 0 0 25px rgba(163, 230, 53, 0.35)'
                : isConnected
                  ? '0 0 18px rgba(132, 204, 22, 0.16)'
                  : 'none',
          },
        }
      }),
    )

    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        const isConnected =
          edge.source === nodeId
          || edge.target === nodeId

        return {
          ...edge,

          animated: isConnected,

          style: {
            stroke:
              isConnected
                ? '#bef264'
                : '#57534e',

            strokeWidth:
              isConnected
                ? 3
                : 1,

            opacity:
              isConnected
                ? 1
                : 0.15,
          },
        }
      }),
    )
  }

  if (loading) {
    return (
      <section>
        <p className="text-stone-400">
          Cargando grafo...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
          <p className="font-medium text-red-300">
            No fue posible cargar el grafo.
          </p>

          <p className="mt-2 text-sm text-red-400">
            {error}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-lime-400">
          Mapa de conocimiento
        </p>

        <h2 className="mt-2 text-3xl font-semibold">
          Grafo del jardín
        </h2>

        <p className="mt-3 max-w-2xl text-stone-400">
          Explora tus notas, mueve los nodos
          y selecciona una idea para descubrir
          sus conexiones.
        </p>

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-lime-400/40 bg-stone-900 px-3 py-1.5 text-stone-300">
            🌱 Semilla
          </span>

          <span className="rounded-full border border-lime-600/40 bg-stone-900 px-3 py-1.5 text-stone-300">
            🌿 Brote
          </span>

          <span className="rounded-full border border-lime-800/60 bg-stone-900 px-3 py-1.5 text-stone-300">
            🌳 Árbol
          </span>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center">
          <p className="text-lg font-medium">
            Tu jardín todavía no tiene notas.
          </p>

          <p className="mt-2 text-sm text-stone-400">
            Crea algunas notas para comenzar
            a construir tu mapa de conocimiento.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 h-[650px] overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={
                onNodesChange
              }
              onEdgesChange={
                onEdgesChange
              }
              onNodeClick={
                handleNodeClick
              }
              onPaneClick={
                resetHighlight
              }
              nodesDraggable
              fitView
              fitViewOptions={{
                padding: 0.25,
              }}
              colorMode="dark"
              minZoom={0.2}
              maxZoom={2}
            >
              <Background
                variant={
                  BackgroundVariant.Dots
                }
                gap={24}
                size={1}
                color="#57534e"
              />

              <Controls />
            </ReactFlow>
          </div>

          {selectedNote && (
            <section className="mt-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-lime-400">
                    Nota seleccionada
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    {
                      maturityConfig[
                        selectedNote.maturity
                      ]?.emoji
                    }{' '}
                    {selectedNote.title}
                  </h3>

                  <p className="mt-2 text-sm text-stone-400">
                    Madurez:{' '}
                    <span className="text-stone-200">
                      {
                        maturityConfig[
                          selectedNote.maturity
                        ]?.label
                        ?? selectedNote.maturity
                      }
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-stone-700 bg-stone-950 px-5 py-4">
                  <p className="text-sm text-stone-400">
                    Conexiones
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-lime-400">
                    {
                      selectedRelations
                        .outgoing.length
                      +
                      selectedRelations
                        .incoming.length
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-stone-800 bg-stone-950 p-5">
                <h4 className="font-medium text-stone-200">
                  Vista previa
                </h4>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-300">
                  {createNotePreview(
                    selectedNote.content,
                  )}
                </p>

                <Link
                  to={`/notes?selected=${encodeURIComponent(
                    selectedNote.id,
                  )}`}
                  className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-lime-300"
                >
                  Abrir nota completa →
                </Link>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-stone-200">
                    Enlaces salientes
                  </h4>

                  <p className="mt-1 text-sm text-stone-500">
                    Esta nota apunta hacia:
                  </p>

                  {selectedRelations
                    .outgoing.length ===
                  0 ? (
                    <p className="mt-3 text-sm text-stone-500">
                      Esta nota todavía no apunta
                      hacia otras ideas.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {selectedRelations
                        .outgoing.map(
                          (relation) => (
                            <div
                              key={
                                relation.id
                              }
                              className="rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm"
                            >
                              →{' '}
                              {getNoteTitle(
                                relation.targetNoteId,
                              )}
                            </div>
                          ),
                        )}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-stone-200">
                    Backlinks
                  </h4>

                  <p className="mt-1 text-sm text-stone-500">
                    Otras notas apuntan hacia esta nota:
                  </p>

                  {selectedRelations
                    .incoming.length ===
                  0 ? (
                    <p className="mt-3 text-sm text-stone-500">
                      Ninguna otra nota apunta
                      todavía hacia esta idea.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {selectedRelations
                        .incoming.map(
                          (relation) => (
                            <div
                              key={
                                relation.id
                              }
                              className="rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm"
                            >
                              ←{' '}
                              {getNoteTitle(
                                relation.sourceNoteId,
                              )}
                            </div>
                          ),
                        )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </section>
  )
}

export default GraphPage
