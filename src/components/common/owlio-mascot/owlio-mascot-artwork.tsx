type OwlioMascotArtworkProps = {
  id: string
}

// Paths and colors come directly from public/owlio-layered.svg.
export function OwlioMascotArtwork({ id }: OwlioMascotArtworkProps) {
  return (
    <svg viewBox="0 0 640 640" width="640" height="640" fill="none" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id={`${id}-body-blue`} data-part="body-blue" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5968FF"/><stop offset="1" stopColor="#303BBE"/></linearGradient>
    <linearGradient id={`${id}-wing-blue`} data-part="wing-blue" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#5364FF"/><stop offset="1" stopColor="#303CBF"/></linearGradient>
    <linearGradient id={`${id}-gold`} data-part="gold" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#FFD778"/><stop offset=".5" stopColor="#FFBF3D"/><stop offset="1" stopColor="#EFA02A"/></linearGradient>
    <linearGradient id={`${id}-face-white`} data-part="face-white" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FFFFFF"/><stop offset="1" stopColor="#F4F3FF"/></linearGradient>
  </defs>
  <g id={`${id}-shadow`} data-part="shadow"><ellipse cx="320" cy="577" rx="177" ry="18" fill="#E8E6FF" opacity=".65"/></g>
  <g data-part="interaction"><g id={`${id}-mascot`} data-part="mascot">
    <g id={`${id}-feet`} data-part="feet">
      <g id={`${id}-foot-left`} data-part="foot-left"><path d="M253 541C237 544 226 557 228 568C230 578 247 579 265 574C281 581 301 575 301 564C301 551 276 539 253 541Z" fill={`url(#${id}-gold)`}/><path d="M251 553Q236 562 240 573M269 553Q255 564 261 575M283 556Q277 565 282 573" fill="none" stroke="#E8A02F" strokeWidth="4" strokeLinecap="round"/></g>
      <g id={`${id}-foot-right`} data-part="foot-right"><path d="M387 541C403 544 414 557 412 568C410 578 393 579 375 574C359 581 339 575 339 564C339 551 364 539 387 541Z" fill={`url(#${id}-gold)`}/><path d="M389 553Q404 562 400 573M371 553Q385 564 379 575M357 556Q363 565 358 573" fill="none" stroke="#E8A02F" strokeWidth="4" strokeLinecap="round"/></g>
    </g>
    <g id={`${id}-body`} data-part="body">
      <path d="M222 327C185 365 181 466 215 518C249 573 373 578 421 522C465 470 450 375 416 332Z" fill="#3037AF"/>
      <path d="M234 329C200 373 198 462 228 508C260 555 365 562 409 514C446 471 433 380 408 338Z" fill={`url(#${id}-body-blue)`}/>
      <path d="M296 349C275 368 270 381 270 404C239 425 237 479 268 509C298 540 362 543 391 512C429 470 404 420 377 404C375 381 358 356 340 349Z" fill={`url(#${id}-face-white)`}/>
      <g id={`${id}-belly-feathers`} data-part="belly-feathers" fill="#D8D6F5"><path d="M284 439Q299 450 313 439Q312 466 299 466Q287 465 284 439Z"/><path d="M336 439Q352 449 365 437Q365 463 352 464Q339 464 336 439Z"/><path d="M310 478Q325 489 340 478Q338 503 325 504Q314 502 310 478Z"/></g>
    </g>
    <g id={`${id}-wing-left`} data-part="wing-left">
      <path d="M231 376C211 366 191 377 169 397C149 415 126 423 104 429C94 432 100 448 116 459C134 472 152 474 170 469C145 481 145 497 163 502C184 508 208 493 220 479C210 499 225 503 237 489C268 454 269 398 231 376Z" fill="#3039B7"/>
      <path d="M226 373C200 370 180 389 163 405C150 418 137 423 126 427C140 447 160 452 183 443C171 454 177 471 194 471C212 471 228 456 231 442C230 460 245 460 251 443C262 413 251 383 226 373Z" fill={`url(#${id}-wing-blue)`}/>
    </g>
    <g id={`${id}-wing-right`} data-part="wing-right">
      <path d="M415 383C442 367 464 338 481 307C495 281 512 291 514 314C517 339 504 363 493 377C520 357 531 363 524 385C517 410 491 435 472 446C494 440 495 452 478 464C457 479 432 483 411 467C391 452 393 405 415 383Z" fill="#3039B7"/>
      <path d="M427 383C451 365 472 338 486 314C494 299 502 308 501 325C500 352 485 373 470 387C490 377 505 372 510 375C508 395 480 422 457 432C475 429 483 431 481 437C464 451 439 463 423 452C407 441 410 400 427 383Z" fill={`url(#${id}-wing-blue)`}/>
    </g>
    <g data-part="head-interaction"><g id={`${id}-head`} data-part="head">
      <path id={`${id}-head-base`} data-part="head-base" d="M178 163C166 148 153 122 164 111C195 137 231 133 264 120C311 100 356 103 392 113C417 102 433 82 441 65C449 53 468 79 471 109C484 132 474 153 469 164C502 201 515 256 496 304C474 357 414 389 329 391C246 393 177 365 156 310C136 260 144 200 178 163Z" fill="#3038B6"/>
      <path d="M176 156C167 142 162 125 166 115C195 139 231 140 269 125C314 106 359 108 393 118C416 108 436 90 444 71C456 80 465 100 464 120C457 141 448 146 433 147C482 166 503 219 489 274C477 322 429 359 353 370C270 382 189 356 165 308C143 262 149 198 176 156Z" fill={`url(#${id}-body-blue)`}/>
      <g id={`${id}-ear-tufts`} data-part="ear-tufts"><path d="M165 115C199 143 235 138 269 125C301 112 332 113 353 126C314 121 299 135 281 153C254 180 199 190 176 159C166 146 162 127 165 115Z" fill="#5060FF"/><path d="M350 135C391 137 426 109 444 71C458 86 467 110 462 124C455 144 436 152 412 148C382 143 370 154 353 170Z" fill="#5B6BFF"/><path d="M179 164Q228 183 267 151Q297 126 330 140Q285 133 264 166Q217 202 179 164Z" fill="#3E4AD3"/></g>
      <path id={`${id}-face`} data-part="face" d="M320 205C303 163 262 153 226 171C181 194 177 258 193 296C210 339 263 353 307 338L328 354L349 339C392 349 448 330 469 290C491 247 476 190 444 169C408 144 355 153 337 191L328 218Z" fill={`url(#${id}-face-white)`}/>
      <g id={`${id}-eyebrows`} data-part="eyebrows" fill="#1C2057"><path d="M230 187Q245 174 262 181C269 185 267 192 260 192L235 198C229 199 225 191 230 187Z"/><path d="M391 179Q409 168 423 180C429 185 424 193 418 190Q408 185 397 190C389 193 385 184 391 179Z"/></g>
      <g id={`${id}-eye-left`} data-part="eye-left"><ellipse cx="251" cy="251" rx="41" ry="48" fill={`url(#${id}-gold)`}/><ellipse cx="253" cy="252" rx="29" ry="36" fill="#1B1B48"/><path d="M216 273Q244 297 281 273Q269 301 247 299Q225 296 216 273Z" fill="#FFE8A6"/><ellipse cx="265" cy="228" rx="13" ry="14" fill="#FFF"/><circle cx="238" cy="269" r="5" fill="#FFF" opacity=".25"/></g>
      <g id={`${id}-eye-right`} data-part="eye-right"><ellipse cx="407" cy="243" rx="41" ry="48" fill={`url(#${id}-gold)`}/><ellipse cx="405" cy="244" rx="29" ry="36" fill="#1B1B48"/><path d="M369 265Q402 291 442 264Q427 293 405 291Q382 290 369 265Z" fill="#FFE8A6"/><ellipse cx="418" cy="220" rx="13" ry="14" fill="#FFF"/><circle cx="391" cy="260" r="5" fill="#FFF" opacity=".25"/></g>
      <g id={`${id}-eyelid-left`} data-part="eyelid-left" opacity="0"><ellipse cx="251" cy="251" rx="44" ry="51" fill="#FAF9FF"/><path d="M221 257Q251 274 282 255" fill="none" stroke="#1B1B48" strokeWidth="9" strokeLinecap="round"/></g>
      <g id={`${id}-eyelid-right`} data-part="eyelid-right" opacity="0"><ellipse cx="407" cy="243" rx="44" ry="51" fill="#FAF9FF"/><path d="M376 249Q407 266 438 247" fill="none" stroke="#1B1B48" strokeWidth="9" strokeLinecap="round"/></g>
      <g id={`${id}-happy-eyes`} data-part="happy-eyes" opacity="0"><ellipse cx="251" cy="251" rx="44" ry="51" fill="#FAF9FF"/><ellipse cx="407" cy="243" rx="44" ry="51" fill="#FAF9FF"/><g fill="none" stroke="#1B1B48" strokeWidth="13" strokeLinecap="round"><path d="M224 254Q249 215 278 250"/><path d="M379 245Q405 207 434 241"/></g></g>
      <g id={`${id}-beak`} data-part="beak"><g id={`${id}-beak-lower`} data-part="beak-lower"><path d="M307 285Q327 277 349 284C349 304 341 324 331 326C320 328 311 308 307 285Z" fill="#F5AE31"/><path d="M314 291Q331 289 343 289Q340 314 332 317Q323 317 314 291Z" fill="#B8561D"/><path d="M323 307Q337 302 339 312Q335 320 331 319Z" fill="#FF8941"/></g><path id={`${id}-beak-upper`} data-part="beak-upper" d="M305 285C310 270 319 260 329 261C340 263 350 273 353 283C347 295 318 298 305 285Z" fill={`url(#${id}-gold)`}/><path d="M311 280Q326 262 338 272" fill="none" stroke="#FFE18B" strokeWidth="5" strokeLinecap="round"/></g>
    </g></g>
  </g></g>
      <g data-part="particles">
        <circle className="owlio-particle owlio-particle-1" cx="170" cy="230" r="6" fill="#5968FF" />
        <path className="owlio-particle owlio-particle-2" d="M475 175h10v20h-10z" fill="#FFBF3D" />
        <circle className="owlio-particle owlio-particle-3" cx="130" cy="350" r="5" fill="#FFBF3D" />
        <path className="owlio-particle owlio-particle-4" d="M500 300h9v16h-9z" fill="#5968FF" />
        <circle className="owlio-particle owlio-particle-5" cx="300" cy="110" r="5" fill="#FFBF3D" />
        <path className="owlio-particle owlio-particle-6" d="M210 140h8v14h-8z" fill="#5968FF" />
      </g>
    </svg>
  )
}
