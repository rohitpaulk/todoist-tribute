IRB.conf[:USE_READLINE] = false
IRB.conf[:PROMPT][:CUSTOM_RAILSBOT] = {
  :PROMPT_I=>"%N(%m):%03n:%i> ",
  :PROMPT_N=>nil,
  :PROMPT_S=>nil,
  :PROMPT_C=>nil,
  :RETURN=>"%s\n",
  :AUTO_INDENT=>false
}
IRB.conf[:PROMPT_MODE] = :CUSTOM_RAILSBOT
