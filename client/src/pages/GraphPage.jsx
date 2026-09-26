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
import { getGalleryImages } from '../services/gallery.js'

const NODE_WIDTH = 240
const NODE_HEIGHT = 64
const NOTE_PREVIEW_LENGTH = 250

const maturityConfig = {
  seed: {
    emoji: '🌱',
    label: 'Semilla',
    borderColor: '#76945d',
  },

  budding: {
    emoji: '🌿',
    label: 'Brote',
    borderColor: '#557a48',
  },

  tree: {
    emoji: '🌳',
    label: 'Árbol',
    borderColor: '#315c3a',
  },
}

const nodeBaseStyle = {
  width: NODE_WIDTH,
  minHeight: NODE_HEIGHT,
  padding: 14,
  borderRadius: 14,
  background: '#faf7ec',
  color: '#25271e',
  border: '1px solid #b9b39d',
  fontSize: 14,
  fontWeight: 500,
}

const imageNodeBaseStyle = {
  width: 32,
  height: 32,
  padding: 0,
  borderRadius: '9999px',
  background: '#e8c94a',
  border: '2px solid #8b7513',
  boxShadow:
    '0 0 0 4px rgba(232, 201, 74, 0.2)',
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
    return 'Esta idea todavía no tiene contenido.'
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
    galleryImages,
    setGalleryImages,
  ] = useState([])

  const [
    selectedNode,
    setSelectedNode,
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

        const [
          notesResponse,
          galleryResponse,
        ] = await Promise.all([
          getNotes(),
          getGalleryImages(),
        ])

        const loadedNotes =
          notesResponse.notes ?? []

        const loadedImages =
          galleryResponse.images ?? []

        const relatedImages =
          loadedImages.filter(
            (image) =>
              Boolean(image.noteId),
          )

        setNotes(loadedNotes)
        setGalleryImages(
          relatedImages,
        )

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

        const noteNodes =
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
                kind: 'note',
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

        const imagesByNote =
          new Map()

        relatedImages.forEach(
          (image) => {
            const current =
              imagesByNote.get(
                image.noteId,
              ) ?? []

            current.push(image)

            imagesByNote.set(
              image.noteId,
              current,
            )
          },
        )

        const imageNodes =
          relatedImages.map(
            (image) => {
              const relatedNotePosition =
                positionsById.get(
                  image.noteId,
                )

              const siblings =
                imagesByNote.get(
                  image.noteId,
                ) ?? []

              const imageIndex =
                siblings.findIndex(
                  (currentImage) =>
                    currentImage.id
                    === image.id,
                )

              const angle =
                (
                  imageIndex /
                  Math.max(
                    siblings.length,
                    1,
                  )
                ) *
                Math.PI *
                2

              const radius =
                210 +
                (
                  imageIndex % 2
                ) * 55

              return {
                id:
                  `image-${image.id}`,
                  className: 'image-node',

                position: {
                  x:
                    (relatedNotePosition
                      ?.x ?? 0)
                    +
                    Math.cos(
                      angle,
                    ) *
                    radius,

                  y:
                    (relatedNotePosition
                      ?.y ?? 0)
                    +
                    Math.sin(
                      angle,
                    ) *
                    radius,
                },

                data: {
                  kind: 'image',
                  imageId: image.id,
                  noteId: image.noteId,
                  label: '',
                },

                style: {
                  ...imageNodeBaseStyle,
                },
              }
            },
          )

        const noteEdges =
          outgoingRelations.map(
            (relation) => ({
              id: relation.id,

              source:
                relation.sourceNoteId,

              target:
                relation.targetNoteId,

              data: {
                kind: 'noteRelation',
              },

              markerEnd: {
                type:
                  MarkerType.ArrowClosed,
              },

              style: {
                stroke: '#315c3a',
                strokeWidth: 1.7,
                opacity: 0.75,
              },
            }),
          )

        const imageEdges =
          relatedImages.map(
            (image) => ({
              id:
                `image-link-${image.id}`,

              source:
                `image-${image.id}`,

              target:
                image.noteId,

              data: {
                kind: 'imageRelation',
              },

              style: {
                stroke: '#b99a1c',
                strokeWidth: 2.2,
                strokeDasharray:
                  '2 9',
                opacity: 0.55,
              },
            }),
          )

        setNodes([
          ...noteNodes,
          ...imageNodes,
        ])

        setEdges([
          ...noteEdges,
          ...imageEdges,
        ])
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
    useMemo(() => {
      if (
        selectedNode?.kind !==
        'note'
      ) {
        return null
      }

      return (
        notes.find(
          (note) =>
            note.id ===
            selectedNode.id,
        ) ?? null
      )
    }, [
      notes,
      selectedNode,
    ])

  const selectedImage =
    useMemo(() => {
      if (
        selectedNode?.kind !==
        'image'
      ) {
        return null
      }

      return (
        galleryImages.find(
          (image) =>
            image.id ===
            selectedNode.id,
        ) ?? null
      )
    }, [
      galleryImages,
      selectedNode,
    ])

  const selectedRelations =
    useMemo(() => {
      if (!selectedNote) {
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
              === selectedNote.id,
          ),

        incoming:
          relations.filter(
            (relation) =>
              relation.targetNoteId
              === selectedNote.id,
          ),
      }
    }, [
      relations,
      selectedNote,
    ])

  const selectedNoteImages =
    useMemo(() => {
      if (!selectedNote) {
        return []
      }

      return galleryImages.filter(
        (image) =>
          image.noteId ===
          selectedNote.id,
      )
    }, [
      galleryImages,
      selectedNote,
    ])

  function getNoteTitle(noteId) {
    return (
      notes.find(
        (note) =>
          note.id === noteId,
      )?.title
      ?? 'Idea no disponible'
    )
  }

  function resetHighlight() {
    setSelectedNode(null)

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (
          node.data.kind ===
          'image'
        ) {
          return {
            ...node,

            style: {
              ...imageNodeBaseStyle,
              opacity: 1,
            },
          }
        }

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
        (edge) => {
          if (
            edge.data?.kind ===
            'imageRelation'
          ) {
            return {
              ...edge,

              animated: false,

              style: {
                stroke: '#b99a1c',
                strokeWidth: 2.2,
                strokeDasharray:
                  '2 9',
                opacity: 0.55,
              },
            }
          }

          return {
            ...edge,

            animated: false,

            style: {
              stroke: '#315c3a',
              strokeWidth: 1.7,
              opacity: 0.75,
            },
          }
        },
      ),
    )
  }

  function handleNoteClick(
    noteId,
  ) {
    setSelectedNode({
      kind: 'note',
      id: noteId,
    })

    const connectedNodeIds =
      new Set([noteId])

    relations.forEach(
      (relation) => {
        if (
          relation.sourceNoteId
          === noteId
        ) {
          connectedNodeIds.add(
            relation.targetNoteId,
          )
        }

        if (
          relation.targetNoteId
          === noteId
        ) {
          connectedNodeIds.add(
            relation.sourceNoteId,
          )
        }
      },
    )

    galleryImages
      .filter(
        (image) =>
          image.noteId ===
          noteId,
      )
      .forEach((image) => {
        connectedNodeIds.add(
          `image-${image.id}`,
        )
      })

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const isConnected =
          connectedNodeIds.has(
            node.id,
          )

        if (
          node.data.kind ===
          'image'
        ) {
          return {
            ...node,

            style: {
              ...imageNodeBaseStyle,

              opacity:
                isConnected
                  ? 1
                  : 0.12,

              boxShadow:
                isConnected
                  ? '0 0 0 3px rgba(232, 201, 74, 0.32)'
                  : 'none',
            },
          }
        }

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
          node.id === noteId

        return {
          ...node,

          style: {
            ...nodeBaseStyle,

            borderColor:
              isSelected
                ? '#315c3a'
                : maturity.borderColor,

            opacity:
              isConnected
                ? 1
                : 0.2,

            boxShadow:
              isSelected
                ? '0 0 0 3px rgba(49, 92, 58, 0.22)'
                : isConnected
                  ? '0 0 0 2px rgba(49, 92, 58, 0.12)'
                  : 'none',
          },
        }
      }),
    )

    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        if (
          edge.data?.kind ===
          'imageRelation'
        ) {
          const isConnected =
            edge.target === noteId

          return {
            ...edge,

            animated: false,

            style: {
              stroke:
                isConnected
                  ? '#b99a1c'
                  : '#8d8978',

              strokeWidth:
                isConnected
                  ? 2.8
                  : 1,

              strokeDasharray:
                '2 9',

              opacity:
                isConnected
                  ? 1
                  : 0.1,
            },
          }
        }

        const isConnected =
          edge.source === noteId
          || edge.target === noteId

        return {
          ...edge,

          animated: isConnected,

          style: {
            stroke:
              isConnected
                ? '#315c3a'
                : '#8d8978',

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

  function handleImageClick(
    imageId,
  ) {
    const image =
      galleryImages.find(
        (currentImage) =>
          currentImage.id ===
          imageId,
      )

    if (!image) {
      return
    }

    setSelectedNode({
      kind: 'image',
      id: imageId,
    })

    const imageNodeId =
      `image-${imageId}`

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const isImage =
          node.id ===
          imageNodeId

        const isRelatedNote =
          node.id ===
          image.noteId

        if (
          node.data.kind ===
          'image'
        ) {
          return {
            ...node,

            style: {
              ...imageNodeBaseStyle,

              opacity:
                isImage
                  ? 1
                  : 0.12,

              boxShadow:
                isImage
                  ? '0 0 12px rgba(253, 224, 71, 1), 0 0 35px rgba(253, 224, 71, 0.75)'
                  : 'none',
            },
          }
        }

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

            opacity:
              isRelatedNote
                ? 1
                : 0.15,

            boxShadow:
              isRelatedNote
                ? '0 0 0 3px rgba(232, 201, 74, 0.28)'
                : 'none',
          },
        }
      }),
    )

    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        if (
          edge.data?.kind ===
          'imageRelation'
        ) {
          const isSelectedEdge =
            edge.source ===
            imageNodeId

          return {
            ...edge,

            animated: false,

            style: {
              stroke:
                isSelectedEdge
                  ? '#b99a1c'
                  : '#8d8978',

              strokeWidth:
                isSelectedEdge
                  ? 3.2
                  : 1,

              strokeDasharray:
                '2 9',

              opacity:
                isSelectedEdge
                  ? 1
                  : 0.08,
            },
          }
        }

        return {
          ...edge,

          animated: false,

          style: {
            stroke: '#8d8978',
            strokeWidth: 1,
            opacity: 0.08,
          },
        }
      }),
    )
  }

  function handleNodeClick(
    event,
    clickedNode,
  ) {
    event.stopPropagation()

    if (
      clickedNode.data.kind ===
      'image'
    ) {
      handleImageClick(
        clickedNode.data.imageId,
      )

      return
    }

    handleNoteClick(
      clickedNode.id,
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
        <p className="eyebrow">
          Mapa de conocimiento
        </p>

        <h2 className="mt-2 text-3xl font-semibold">
          Grafo del jardín
        </h2>

        <p className="mt-3 max-w-2xl text-stone-400">
          Explora tus ideas, mueve los nodos
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

          <span className="rounded-full border border-yellow-400/40 bg-stone-900 px-3 py-1.5 text-stone-300">
            ✦ Imagen asociada
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
          <span>
            Flecha verde = relación entre ideas
          </span>

          <span>
            Línea amarilla discontinua = imagen asociada a una idea
          </span>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center">
          <p className="text-lg font-medium">
            Tu jardín todavía no tiene ideas.
          </p>

          <p className="mt-2 text-sm text-stone-400">
            Crea algunas ideas para comenzar
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
              colorMode="light"
              minZoom={0.2}
              maxZoom={2}
            >
              <Background
                variant={
                  BackgroundVariant.Dots
                }
                gap={24}
                size={1}
                color="#b9b39d"
              />

              <Controls />
            </ReactFlow>
          </div>

          {selectedNote && (
            <section className="mt-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="eyebrow">
                    Idea seleccionada
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

                <div className="flex gap-3">
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

                  <div className="rounded-xl border border-yellow-900/60 bg-stone-950 px-5 py-4">
                    <p className="text-sm text-stone-400">
                      Imágenes
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-yellow-300">
                      {
                        selectedNoteImages.length
                      }
                    </p>
                  </div>
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
                  to={`/notes/${selectedNote.id}`}
                  className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-lime-300"
                >
                  Abrir idea completa →
                </Link>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-stone-200">
                    Enlaces salientes
                  </h4>

                  <p className="mt-1 text-sm text-stone-500">
                    Esta idea apunta hacia:
                  </p>

                  {selectedRelations
                    .outgoing.length ===
                  0 ? (
                    <p className="mt-3 text-sm text-stone-500">
                      Esta idea todavía no apunta
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
                    Otras ideas apuntan hacia esta idea:
                  </p>

                  {selectedRelations
                    .incoming.length ===
                  0 ? (
                    <p className="mt-3 text-sm text-stone-500">
                      Ninguna otra idea apunta
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

              {selectedNoteImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-stone-200">
                    Imágenes asociadas
                  </h4>

                  <p className="mt-1 text-sm text-stone-500">
                    Recursos visuales vinculados directamente con esta idea.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedNoteImages.map(
                      (image) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() =>
                            handleImageClick(
                              image.id,
                            )
                          }
                          className="overflow-hidden rounded-xl border border-stone-700 transition hover:border-yellow-400"
                        >
                          <img
                            src={
                              image.imageUrl
                            }
                            alt={
                              image.description
                              || 'Imagen asociada'
                            }
                            className="h-20 w-20 object-cover"
                          />
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {selectedImage && (
            <section className="mt-6 rounded-2xl border border-yellow-900/60 bg-stone-900 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-yellow-300">
                Imagen seleccionada
              </p>

              <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
                <div className="overflow-hidden rounded-2xl border border-stone-700 bg-stone-950">
                  <img
                    src={
                      selectedImage.imageUrl
                    }
                    alt={
                      selectedImage.description
                      || 'Imagen del jardín'
                    }
                    className="h-full max-h-80 w-full object-contain"
                  />
                </div>

                <div>
                  <div>
                    <p className="text-sm text-stone-500">
                      Descripción
                    </p>

                    <p className="mt-2 text-stone-200">
                      {
                        selectedImage.description
                        || 'Sin descripción.'
                      }
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-stone-500">
                      Relacionada con
                    </p>

                    <p className="mt-2 font-medium text-stone-200">
                      {getNoteTitle(
                        selectedImage.noteId,
                      )}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-stone-500">
                      Añadida
                    </p>

                    <p className="mt-2 text-stone-300">
                      {new Date(
                        selectedImage.createdAt,
                      ).toLocaleString(
                        'es-MX',
                      )}
                    </p>
                  </div>

                  <Link
                    to={`/gallery?selectedImage=${selectedImage.id}`}
                    className="mt-6 inline-block rounded-xl bg-yellow-300 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-yellow-200"
                  >
                    Ver en galería →
                  </Link>
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
